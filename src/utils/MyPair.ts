import {Pair, Token, TokenAmount, WETH} from "@uniswap/sdk";
import {keccak256, pack} from '@ethersproject/solidity'
import {getCreate2Address,getAddress} from '@ethersproject/address'

export const G_CONFIG = {
    router: getAddress("0xb808dffd94efc1bfcd71cb29a210d385c3f4a63a"),
    weth: getAddress("0x4351e71a28b0d5236a9abf598c6c31b9b36e4674"),
    factory: getAddress("0xbf5264427b5159f6062fe8c63f21fd9c9be2784a"),
    call: getAddress("0xefb43a7f20eaf2a6a8d9ce5f265fa78ce6c824cc"),
    codeHash: "0x"+"7e94d55cb675b314384bbad42db81f28d6e23765aeb5e4f4d9fc32c135dba2d4",
    tokens: [
        {
            decimals: 18,
            symbol: 'USDC',
            name: 'USDC',
            chainId: 336,
            address: getAddress('0xf05de2CBE4A3d0fE4f93ba7c40aB629bF33530e5'),
            logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/ctoken_usdc.svg'
        },
        {
            decimals: 18,
            symbol: 'USDT',
            name: 'USDT',
            chainId: 336,
            address: getAddress('0x64F3F23EEf13D12f5DC28d6D0bB7908BeB069954'),
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
