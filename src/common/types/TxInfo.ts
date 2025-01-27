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
  gasLimit: bigint;
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
  txHash: string;
  type: string;
  value: bigint;
  wallet: string;
  addressType?: string;
  fee?: bigint;
  rskGas?: bigint;
  btcEstimatedFee?: bigint;
  provider?: string;
  details?: Record<string, unknown>;
  quote?: PeginQuoteDbModel | PegoutQuoteDbModel;
  quoteHash?: string;
  acceptedQuoteSignature?: string;
}
