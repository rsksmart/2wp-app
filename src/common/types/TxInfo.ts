export interface BaseQuoteDbModel {
  agreementTimestamp: number;
  gasFeeOnWei: number;
  nonce: number;
  penaltyFeeOnWei: number;
  btcRefundAddress: string;
  lbcAddress: string;
  lpBtcAddress: string;
  rskRefundAddress: string;
  liquidityProviderRskAddress: string;
}

export interface PeginQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnSatoshi: number;
  callOnRegister: boolean;
  confirmations: number;
  contractAddr: string;
  data: string;
  fedBTCAddr: string;
  gasLimit: number;
  lpCallTime: number;
  productFeeAmountOnSatoshi: number;
  timeForDepositInSeconds: number;
  valueOnSatoshi: number;
}

export interface PegoutQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnWei: number;
  depositAddr: string;
  depositConfirmations: number;
  depositDateLimit: number;
  expireBlocks: number;
  expireDate: number;
  productFeeAmountOnWei: number;
  transferConfirmations: number;
  transferTime: number;
  valueOnWei: number;
}

export interface TxInfo {
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
  acceptedQuoteSignature?: string;
}
