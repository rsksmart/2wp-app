import { TxStatus } from '@/types/store';

export interface StatusState extends TxStatus{
    statusMessage: string,
    activeMessageStyle: string,
    isRejected: boolean,
    error: boolean,
    errorMessage: string,
    txStatus?: TxStatus,
}

export enum TxSummaryAction {
    TRANSACTION = 'TRANSACTION',
    STATUS = 'STATUS'
}

export enum TxSummaryOrientation {
    VERITICAL = 'VERTICAL',
    HORIZONTAL = 'HORIZONTAL'
}
