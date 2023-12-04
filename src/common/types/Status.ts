import { TxStatus } from '@/common/types/store';

export interface StatusState extends TxStatus{
    statusMessage: string,
    activeMessageStyle: string,
    isRejected: boolean,
    error: boolean,
    errorMessage: string,
    txStatus?: TxStatus,
}

export enum TxSummaryOrientation {
    VERTICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL'
}
