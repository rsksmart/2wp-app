import * as Bowser from 'bowser';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  AppNetwork,
  TxStatusType,
  TxStatusMessage,
  WalletAddress,
  RequestBalance,
  PegoutStatus,
  SatoshiBig,
} from '@/common/types';
import { BridgeService } from '@/common/services/BridgeService';
import moment from 'moment';

export function getAccountType(address: string, network: AppNetwork): string {
  const [legacyTestReg, segwitTestReg, nativeTestReg] = network === constants.BTC_NETWORK_MAINNET
    ? [
      new RegExp(constants.MAINNET_ADDRESS_LEGACY),
      new RegExp(constants.MAINNET_ADDRESS_SEGWIT),
      new RegExp(constants.MAINNET_ADDRESS_NSEGWIT),
    ]
    : [
      new RegExp(constants.TESTNET_ADDRESS_LEGACY),
      new RegExp(constants.TESTNET_ADDRESS_SEGWIT),
      new RegExp(constants.TESTNET_ADDRESS_NSEGWIT),
    ];
  if (legacyTestReg.test(address)) return constants.BITCOIN_LEGACY_ADDRESS;
  if (segwitTestReg.test(address)) return constants.BITCOIN_SEGWIT_ADDRESS;
  if (nativeTestReg.test(address)) return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
  return constants.BITCOIN_MULTISIGNATURE_ADDRESS;
}

export function getBtcBaseExplorerUrl() {
  let network = '';
  switch (EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin) {
    case constants.BTC_NETWORK_TESTNET:
      network = 'btc-testnet';
      break;
    case constants.BTC_NETWORK_MAINNET:
      network = 'btc';
      break;
    default:
      network = 'btc-testnet';
      break;
  }
  return `https://live.blockcypher.com/${network}`;
}

export function getBtcTxExplorerUrl(txId: string) {
  return `${getBtcBaseExplorerUrl()}/tx/${txId}`;
}

export function getBtcAddressExplorerUrl(address: string) {
  return `${getBtcBaseExplorerUrl()}/address/${address}`;
}

export function getRskBaseExplorerUrl() {
  let network = '';
  if (EnvironmentAccessorService
    .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_TESTNET) {
    network = '.testnet';
  }
  return `https://explorer${network}.rootstock.io`;
}

export function getRskTxExplorerUrl(txId: string) {
  return `${getRskBaseExplorerUrl()}/tx/${txId}`;
}

export function getRskAddressExplorerUrl(address: string) {
  return `${getRskBaseExplorerUrl()}/address/${address}`;
}

export function getEstimatedFee(): Promise<SatoshiBig> {
  return new Promise<SatoshiBig>((resolve, reject) => {
    const bridgeService = new BridgeService();
    Promise.all([
      bridgeService.getEstimatedFeesForNextPegOutEvent(),
      bridgeService.getQueuedPegoutsCount(),
    ])
      .then(([nextPegoutCost, pegoutQueueCount]) => {
        const estimatedFee = nextPegoutCost / (pegoutQueueCount + 1n);
        resolve(new SatoshiBig(estimatedFee, 'satoshi'));
      })
      .catch(reject);
  });
}

export class Machine<States extends string> {
  value: States;

  constructor(value: States) {
    this.value = value;
  }

  public matches(values: string[]) {
    return values.map((v) => v === this.value).some((e) => e);
  }

  public send(newValue: States) {
    this.value = newValue;
  }
}

export function getTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${paddedMinutes}`;
}

export function isAllowedCurrentBrowser() {
  const browser = Bowser.getParser(window.navigator.userAgent);
  return browser.getBrowserName() === 'Chrome' || window.navigator.brave;
}

export function isBTCAmountValidRegex(bitcoinAmount: string) {
  return /^[0-9]{1,8}(\.[0-9]{0,8})?$/.test(bitcoinAmount.toString());
}

export function isRBTCAmountValidRegex(rbctAmount: string) {
  return /^[0-9]{1,8}(\.[0-9]{0,18})?$/.test(rbctAmount.toString());
}

export function setStatusMessage(txType: string, status: string): TxStatusMessage {
  const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  let statusMessage = '';
  let activeMessageStyle = '';
  let isRejected = false;

  let error = false;
  let errorMessage = '';

  switch (txType) {
    case TxStatusType.PEGIN:
      switch (status) {
        case constants.PegStatus.CONFIRMED:
          statusMessage = 'Your transaction was successfully processed!';
          activeMessageStyle = 'statusSuccess';
          isRejected = false;
          break;
        case constants.PegStatus.WAITING_CONFIRMATIONS:
          statusMessage = `More ${environmentContext.getBtcText()} confirmations are yet needed, please wait`;
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case constants.PegStatus.REJECTED_REFUND:
          statusMessage = `Your transaction was declined. \n Your ${environmentContext.getBtcTicker()} will be sent to the refund address`;
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          break;
        case constants.PegStatus.REJECTED_NO_REFUND:
          statusMessage = 'Your transaction was declined.';
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          break;
        case constants.PegStatus.NOT_IN_BTC_YET:
          statusMessage = `Your transaction is not in ${environmentContext.getBtcText()} yet.`;
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          break;
        case constants.PegStatus.NOT_IN_RSK_YET:
          statusMessage = `Waiting to be processed by the ${environmentContext.getRskText()} network`;
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case constants.PegStatus.ERROR_BELOW_MIN:
          error = true;
          errorMessage = 'The transaction is below the minimum amount required';
          break;
        case constants.PegStatus.ERROR_NOT_A_PEGIN:
          error = true;
          errorMessage = 'Unfortunately this is not recognized as a peg-in transaction, please check it and try again';
          break;
        case constants.PegStatus.ERROR_UNEXPECTED:
          error = true;
          errorMessage = 'The input transaction is not valid, please check it and try again';
          break;
        default:
      }
      break;
    case TxStatusType.FLYOVER_PEGOUT:
      switch (status) {
        case constants.FlyoverPegoutStatus.PENDING:
          statusMessage = 'Your peg-out is being processed';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case constants.FlyoverPegoutStatus.COMPLETED:
          statusMessage = 'Your transaction was successfully processed!';
          activeMessageStyle = 'statusSuccess';
          isRejected = false;
          break;
        default:
      }
      break;
    case TxStatusType.PEGOUT:
      switch (status) {
        case PegoutStatus.PENDING:
          statusMessage = 'Your peg-out is waiting to be mined';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case PegoutStatus.RECEIVED:
          statusMessage = 'Your peg-out is being processed';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case PegoutStatus.NOT_FOUND:
          statusMessage = 'Unfortunately this is not recognized as a peg-out transaction, please check it and try again';
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          error = true;
          errorMessage = 'Unfortunately this is not recognized as a peg-out transaction, please check it and try again';
          break;
        case PegoutStatus.NOT_PEGOUT_TX:
          statusMessage = 'Unfortunately this is not recognized as a peg-out transaction, please check it and try again';
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          error = true;
          errorMessage = 'Unfortunately this is not recognized as a peg-out transaction, please check it and try again';
          break;
        case PegoutStatus.RELEASE_BTC:
          statusMessage = 'Congratulations! Your peg-out was processed';
          activeMessageStyle = 'statusSuccess';
          isRejected = false;
          break;
        case PegoutStatus.REJECTED:
          statusMessage = 'Your peg-out was rejected. \n But don’t worry your funds were reimbursed';
          activeMessageStyle = 'statusRejected';
          isRejected = true;
          break;
        case PegoutStatus.WAITING_FOR_CONFIRMATION:
          statusMessage = `More ${environmentContext.getRskText()} confirmations are yet needed, please wait`;
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case PegoutStatus.WAITING_FOR_SIGNATURE:
          statusMessage = 'Your peg-out is being processed';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        default:
          error = true;
          errorMessage = 'The input transaction is not valid, please check it and try again';
          break;
      }
      break;
    case TxStatusType.INVALID_DATA:
      activeMessageStyle = 'statusRejected';
      error = true;
      errorMessage = 'The hash does not match any 2wp operation.';
      break;
    case TxStatusType.UNSET_STATUS:
      activeMessageStyle = 'statusProgress';
      break;
    case TxStatusType.UNEXPECTED_ERROR:
      activeMessageStyle = 'statusRejected';
      error = true;
      errorMessage = 'The input transaction is not valid, please check it and try again';
      break;
    default:
      error = true;
      errorMessage = 'The input transaction is not valid, please check it and try again';
      break;
  }
  return {
    statusMessage,
    activeMessageStyle,
    isRejected,
    error,
    errorMessage,
  };
}

export function formatTxId(value: string) : string {
  return `${value.substr(0, 24)}...${value.substr(60, 64)}`;
}

export function convertToRequestBalance(walletAddress: WalletAddress[]) : RequestBalance[] {
  const retorno : RequestBalance[] = [];

  if (walletAddress) {
    walletAddress.forEach((element) => {
      retorno.push({ address: element.address });
    });
  }

  return retorno;
}

export const remove0x = (value: string) => (!value.startsWith('0x') ? value : value.substring(2));

export function getCookie(cname: string) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  let cookieValue = '';
  ca.forEach((value) => {
    let c = value;
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      cookieValue = c.substring(name.length, c.length);
    }
  });
  return cookieValue;
}

export function setCookie(
  cookieName: string,
  cookieValue: number | string,
  expirationHours: number,
) {
  const d = new Date();
  d.setTime(d.getTime() + (expirationHours * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
}

export function blockConfirmationsToTimeString(confirmations: number): string {
  const BLOCK_CONFIRMATION_TIME_IN_MINUTES = 10;
  return moment.duration(confirmations * BLOCK_CONFIRMATION_TIME_IN_MINUTES, 'minutes').humanize(false, { h: 34 });
}

export function awaitTimeout(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, ms);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function promiseWithTimeout(promise: Promise<any>, timeoutMs: number) {
  return Promise.race([promise, awaitTimeout(timeoutMs)]);
}

export function truncateString(str: string) {
  if (!str) return '';
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}
