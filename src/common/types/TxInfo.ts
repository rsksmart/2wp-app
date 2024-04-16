export interface TxInfo {
  sessionId: string;
  txHash: string;
  type: string;
  value: number;
  wallet: string;
  addressType?: string;
  fee?: number;
  rskGas?: number;
  btcEstimatedFee?: number;
  provider?: string;
  details?: Record<string, unknown>;
}
