export interface BaseQuoteDbModel {
  agreementTimestamp: number;
  gasFeeOnWei: bigint;
  nonce: bigint;
  penaltyFeeOnWei: bigint;
  btcRefundAddress: string;
  lbcAddress: string;
  lpBtcAddress: string;
  rskRefundAddress: string;
  liquidityProviderRskAddress: string;
}

export interface PeginQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnSatoshi: bigint;
  callOnRegister: boolean;
  confirmations: number;
  contractAddr: string;
  data: string;
  fedBTCAddr: string;
  gasLimit: number;
  lpCallTime: number;
  productFeeAmountOnSatoshi: bigint;
  timeForDepositInSeconds: number;
  valueOnSatoshi: bigint;
}

export interface PegoutQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnWei: bigint;
  depositAddr: string;
  depositConfirmations: number;
  depositDateLimit: number;
  expireBlocks: number;
  expireDate: number;
  productFeeAmountOnWei: bigint;
  transferConfirmations: number;
  transferTime: number;
  valueOnWei: bigint;
}

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
  quote?: PeginQuoteDbModel | PegoutQuoteDbModel;
  quoteHash?: string;
}
