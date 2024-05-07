import { BigNumber, BigNumberish, BytesLike } from 'ethers';
import { AccessListish } from 'ethers/lib/utils';

export interface Log {
    blockNumber: number;
    blockHash: string;
    transactionIndex: number;
    removed: boolean;
    address: string;
    data: string;
    topics: Array<string>;
    transactionHash: string;
    logIndex: number;
}

export interface TransactionReceipt {
    to: string;
    from: string;
    contractAddress: string,
    transactionIndex: number,
    root?: string,
    gasUsed: BigNumber,
    logsBloom: string,
    blockHash: string,
    transactionHash: string,
    logs: Array<Log>,
    blockNumber: number,
    confirmations: number,
    cumulativeGasUsed: BigNumber,
    effectiveGasPrice: BigNumber,
    byzantium: boolean,
    type: number;
    status?: number
}

export interface TransactionResponse {
    hash: string;
    blockNumber?: number,
    blockHash?: string,
    timestamp?: number,
    confirmations: number,
    from: string;
    raw?: string,
    wait: (confirmations?: number) => Promise<TransactionReceipt>
}

export type TransactionRequest = {
    to?: string,
    from?: string,
    nonce?: BigNumberish,
    gasLimit?: BigNumberish,
    gasPrice?: BigNumberish,
    data?: BytesLike,
    value?: BigNumberish,
    chainId?: number
    type?: number;
    accessList?: AccessListish;
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
    customData?: Record<string, unknown>;
    ccipReadEnabled?: boolean;
}
