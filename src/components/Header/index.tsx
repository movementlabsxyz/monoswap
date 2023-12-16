import { ChainId } from '@uniswap/sdk'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'

import styled from 'styled-components'

import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_white.svg'
import Wordmark from '../../assets/svg/wordmark.svg'
import WordmarkDark from '../../assets/svg/wordmark_white.svg'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { useMintableERC20Contract } from '../../hooks/useContract'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from '../../utils'
import { addTransaction } from '../../state/transactions/actions'
import { YellowCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'
import { BigNumber } from '@ethersproject/bignumber'

import Row, { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import VersionSwitch from './VersionSwitch'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 12px 0 0 0;
    width: calc(100%);
    position: relative;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;

  :hover {
    cursor: pointer;
  }
`

const TitleText = styled(Row)`
  width: fit-content;
  white-space: nowrap;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;

  :focus {
    border: 1px solid blue;
  }
`

const TestnetWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;
  pointer-events: auto;
`

const NetworkCard = styled(YellowCard)`
  width: fit-content;
  margin-right: 10px;
  border-radius: 12px;
  padding: 8px 12px;
`


const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    img { 
      width: 4.5rem;
    }
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`


const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: null,
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const usdcContract = useMintableERC20Contract("0x4EA7092BAA42008372A98A2c46AAf385d480abA8")
  const usdtContract = useMintableERC20Contract("0xAe065d169f16DA25D2B06E66947e91C058912d4A")


  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [isDark] = useDarkModeManager()

  const handleMint = async (account: string | null | undefined, usdc: boolean) => {
    if (!account) return
    console.log(usdcContract);
    if (usdc) {

      try {
        await usdcContract?.mint(account,BigNumber.from("1000000000000000000000"));
      } catch (e) {
        console.log("error", e)
      }
    } else {
      try {
        await usdtContract?.mint(account,BigNumber.from("1000000000000000000000"));
      } catch (e) {
        console.log("error", e)
      }

    }
  }


  const buttonStyle = {
    color: isDark ? "white" : "black",
    fontFamily: "monospace",
    textDecoration: "none",
    border: "1px solid #ccc",
    borderRadius: "12px",
    padding: "0.5rem",
    alignItems: "center",
    justifyContent: "space-between",
    width: "fit-content",
    height: "fit-content",
    margin: "0 0 0 1rem",
    backgroundColor: isDark ? "#333" : "white",
    boxShadow: isDark ? "0 0 5px #333" : "0 0 5px #ccc",
    cursor: "pointer",
  }

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start' }} padding="1rem 1rem 0 1rem">
        <HeaderElement>
          <Title href="." style={{
            textDecoration: "none"
          }}>

            <img width={"60px"} src={isDark ? LogoDark : Logo} alt="logo" />

            <h3 style={{
              color: isDark ? "white" : "black",
              fontFamily: "monospace",
              textDecoration: "none"
            }}>monoswap</h3>
          </Title>
        </HeaderElement>
        <HeaderControls>
          <HeaderElement>
            <div style={{
              display: "flex",
            }}>
              <button onClick={() => handleMint(account, true)} style={buttonStyle}>
                Mint USDC
              </button>
              <button onClick={() => handleMint(account, false)} style={buttonStyle}>
                Mint USDT
              </button>
            </div>
            <TestnetWrapper>
              {!isMobile && chainId && NETWORK_LABELS[chainId] && <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>}
            </TestnetWrapper>
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  {userEthBalance?.toSignificant(4)} ETH
                </BalanceText>
              ) : null}

              <Web3Status />
            </AccountElement>
          </HeaderElement>
          <HeaderElementWrap>
            {/*<VersionSwitch />*/}
            <Settings />
            {/*<Menu />*/}
          </HeaderElementWrap>
        </HeaderControls>
      </RowBetween>
    </HeaderFrame>
  )
}
