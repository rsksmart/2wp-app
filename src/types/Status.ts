import { TxStatus } from '@/types/store';

export interface StatusState extends TxStatus{
    statusMessage: string,
    activeMessageStyle: string,
    isRejected: boolean,
    error: boolean,
    errorMessage: string,
    txStatus?: TxStatus,
}
