import {Pair, Token, TokenAmount, WETH} from "@uniswap/sdk";
import {keccak256, pack} from '@ethersproject/solidity'
import {getCreate2Address,getAddress} from '@ethersproject/address'

/**
 * "address": {
        "USDC": "0x4EA7092BAA42008372A98A2c46AAf385d480abA8",
        "USDT": "0xAe065d169f16DA25D2B06E66947e91C058912d4A",
        "WETH": "0x4dAE7042D681274E184902c65bfFb0698DA10585",
        "ROUTER": "0x9922dac794FCb4b8F9f138c5e46fc32d06f8Ae08",
        "FACTORY": "0x9Ed27eE971028226b0F31ce2249d079E6d998c37",
        "MULTICALL": "0x25a8227206e037c74CfeC5Ad790E1991fBa0DC13"
    }
 */
export const G_CONFIG = {
    router: getAddress("0x9922dac794FCb4b8F9f138c5e46fc32d06f8Ae08"),
    weth: getAddress("0x4dAE7042D681274E184902c65bfFb0698DA10585"),
    factory: getAddress("0x9Ed27eE971028226b0F31ce2249d079E6d998c37"),
    call: getAddress("0x25a8227206e037c74CfeC5Ad790E1991fBa0DC13"),
    codeHash: "0x"+"7e94d55cb675b314384bbad42db81f28d6e23765aeb5e4f4d9fc32c135dba2d4",
    tokens: [
        {
            decimals: 18,
            symbol: 'USDC',
            name: 'USDC',
            chainId: 336,
            address: getAddress("0x4EA7092BAA42008372A98A2c46AAf385d480abA8"),
            logoURI: 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/ctoken_usdc.svg'
        },
        {
            decimals: 18,
            symbol: 'USDT',
            name: 'USDT',
            chainId: 336,
            address: getAddress("0xAe065d169f16DA25D2B06E66947e91C058912d4A"),
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
