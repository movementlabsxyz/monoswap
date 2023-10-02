import {Pair, Token, TokenAmount, WETH} from "@uniswap/sdk";
import {keccak256, pack} from '@ethersproject/solidity'
import {getCreate2Address} from '@ethersproject/address'

export const G_CONFIG = {
    router: "0x10fbb33c1621c6791c3d1bb9d67b73959597b3d0",
    weth: "0x616e389fffeef9ce63f675bd5b980ec3998d3ac1",
    factory: "0x7b1cfa8b675ade5a22cbecc645af8bfde83675cd",
    call: "0xc059f474a449f1028fb3b622e7d061c4d03fbfca",
    codeHash: "0x"+"7e94d55cb675b314384bbad42db81f28d6e23765aeb5e4f4d9fc32c135dba2d4",
    tokens: [
        {
            decimals: 18,
            symbol: 'USDC',
            name: 'USDC',
            chainId: 336,
            address: '0x78d4a7f46e456c8858ba2a4f4c344148c7ce429f',
            logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/ctoken_usdc.svg'
        },
        {
            decimals: 18,
            symbol: 'USDT',
            name: 'USDT',
            chainId: 336,
            address: '0xfffc88fd7dbe277389e4a37083ce5d1fe09ccbbe',
            logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg'
        }
    ]
}

const computePairAddress = ({
                                factoryAddress,
                                tokenA,
                                tokenB
                            }: {
    factoryAddress: string
    tokenA: Token
    tokenB: Token
}): string => {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    return getCreate2Address(
        factoryAddress,
        keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
        G_CONFIG.codeHash
    )
}

export class MyPair extends Pair {
    constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount) {
        super(tokenAmountA, tokenAmountB)
        const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
            ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.liquidityToken = new Token(tokenAmounts[0].token.chainId, MyPair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, 'UNI-V2', 'Uniswap V2');
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this["tokenAmounts"] = tokenAmounts;
    }

    public static getAddress(tokenA: Token, tokenB: Token): string {
        const pair = computePairAddress({
            tokenA,
            tokenB,
            factoryAddress: G_CONFIG.factory
        })
        console.log("-----pair-----", pair)
        return pair
    }

}

export const GWETH = {
    ...WETH,
    336: G_CONFIG.weth
}
