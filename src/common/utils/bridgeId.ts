import { TxStatusType } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { BTC_NETWORK_TESTNET } from '@/common/store/constants';

export const BRIDGE_ID_SEPARATOR = '-';

export enum BridgeIdSource {
  PEGIN = 'pegin',
  PEGOUT = 'pegout',
  FLYOVER = 'flyover',
}

export enum BridgeNetwork {
  BTC = 'btc',
  RSK = 'rsk',
}

export interface BridgeIdParams {
  source: BridgeIdSource;
  providerId: string;
  txHash: string;
  network: BridgeNetwork;
  providerHash?: string;
}

function isTestnet(): boolean {
  return EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === BTC_NETWORK_TESTNET;
}

export function createBridgeId({
  source, providerId, txHash, network, providerHash,
}: BridgeIdParams): string {
  const prefix = isTestnet() ? 't' : '';
  const base = `${prefix}${source}${BRIDGE_ID_SEPARATOR}${providerId}${BRIDGE_ID_SEPARATOR}${txHash}${BRIDGE_ID_SEPARATOR}${network}`;
  return providerHash ? `${base}${BRIDGE_ID_SEPARATOR}${providerHash}` : base;
}

function hasValidPartCount(bridgeId: string): boolean {
  return bridgeId.split(BRIDGE_ID_SEPARATOR).length >= 4;
}

export function parseBridgeId(bridgeId: string): BridgeIdParams {
  if (!hasValidPartCount(bridgeId)) {
    throw new Error('Invalid bridge id format.');
  }
  const parts = bridgeId.split(BRIDGE_ID_SEPARATOR);
  const rawSource = bridgeId.startsWith('t') ? parts[0].slice(1) : parts[0];
  return {
    source: rawSource as BridgeIdSource,
    providerId: parts[1],
    txHash: parts[2],
    network: parts[3] as BridgeNetwork,
    providerHash: parts.length > 4 ? parts.slice(4).join(BRIDGE_ID_SEPARATOR) : undefined,
  };
}

export function isValidBridgeId(bridgeId: string): boolean {
  if (!hasValidPartCount(bridgeId)) return false;

  let parsed: BridgeIdParams;
  try {
    parsed = parseBridgeId(bridgeId);
  } catch {
    return false;
  }

  const {
    source, providerId, txHash, network, providerHash,
  } = parsed;

  if (!Object.values(BridgeIdSource).includes(source)) return false;
  if (!providerId || providerId.length === 0) return false;
  if (!network || !Object.values(BridgeNetwork).includes(network)) return false;

  if (source === BridgeIdSource.PEGIN && network !== BridgeNetwork.BTC) return false;
  if (source === BridgeIdSource.PEGOUT && network !== BridgeNetwork.RSK) return false;

  if (source === BridgeIdSource.FLYOVER && Number.isNaN(Number(providerId))) return false;

  const btcTxHashRegex = /^[a-fA-F0-9]{64}$/;
  const rskTxHashRegex = /^(0x)?[a-fA-F0-9]{64}$/;
  if (network === BridgeNetwork.BTC && !btcTxHashRegex.test(txHash)) return false;
  if (network === BridgeNetwork.RSK && !rskTxHashRegex.test(txHash)) return false;

  if (source === BridgeIdSource.FLYOVER && (!providerHash || providerHash.length === 0)) {
    return false;
  }

  return true;
}

export function bridgeIdToTxStatusType(bridgeId: string): TxStatusType {
  const { source, network } = parseBridgeId(bridgeId);
  if (source === BridgeIdSource.PEGIN) return TxStatusType.PEGIN;
  if (source === BridgeIdSource.PEGOUT) return TxStatusType.PEGOUT;
  if (source === BridgeIdSource.FLYOVER && network === BridgeNetwork.BTC) {
    return TxStatusType.FLYOVER_PEGIN;
  }
  if (source === BridgeIdSource.FLYOVER && network === BridgeNetwork.RSK) {
    return TxStatusType.FLYOVER_PEGOUT;
  }
  return TxStatusType.UNEXPECTED_ERROR;
}

export function extractTxHash(value: string): string {
  if (isValidBridgeId(value)) {
    return parseBridgeId(value).txHash;
  }
  return value;
}
