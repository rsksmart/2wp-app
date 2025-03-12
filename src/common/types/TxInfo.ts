export interface BaseQuoteDbModel {
  agreementTimestamp: string;
  gasFeeOnWei: string;
  nonce: string;
  penaltyFeeOnWei: string;
  btcRefundAddress: string;
  lbcAddress: string;
  lpBtcAddress: string;
  rskRefundAddress: string;
  liquidityProviderRskAddress: string;
}

export interface PeginQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnSatoshi: string;
  callOnRegister: boolean;
  confirmations: string;
  contractAddr: string;
  data: string;
  fedBTCAddr: string;
  gasLimit: string;
  lpCallTime: string;
  productFeeAmountOnSatoshi: string;
  timeForDepositInSeconds: string;
  valueOnSatoshi: string;
}

export interface PegoutQuoteDbModel extends BaseQuoteDbModel {
  callFeeOnWei: string;
  depositAddr: string;
  depositConfirmations: string;
  depositDateLimit: string;
  expireBlocks: string;
  expireDate: string;
  productFeeAmountOnWei: string;
  transferConfirmations: string;
  transferTime: string;
  valueOnWei: string;
}

export interface TxInfo {
  txHash: string;
  type: string;
  value: string;
  wallet: string;
  addressType?: string;
  fee?: string;
  rskGas?: string;
  btcEstimatedFee?: string;
  provider?: string;
  details?: Record<string, unknown>;
  quote?: PeginQuoteDbModel | PegoutQuoteDbModel;
  quoteHash?: string;
  acceptedQuoteSignature?: string;
}
