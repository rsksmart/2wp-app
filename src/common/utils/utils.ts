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
  Browser,
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
      network = '/testnet';
      break;
    case constants.BTC_NETWORK_MAINNET:
      network = '';
      break;
    default:
      network = '/testnet';
      break;
  }
  return `https://mempool.space${network}`;
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

export function getEstimatedFee(pegoutAlreadyRequested = false): Promise<SatoshiBig> {
  return new Promise<SatoshiBig>((resolve, reject) => {
    const bridgeService = new BridgeService();
    Promise.all([
      bridgeService.getEstimatedFeesForNextPegOutEvent(),
      bridgeService.getQueuedPegoutsCount(),
    ])
      .then(([nextPegoutCost, pegoutQueueCount]) => {
        if (pegoutAlreadyRequested && pegoutQueueCount !== 0n) {
          const currentEstimatedFee = nextPegoutCost / pegoutQueueCount;
          resolve(new SatoshiBig(currentEstimatedFee, 'satoshi'));
          return;
        }
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

export function isMobileDevice() {
  const platform = Bowser.getParser(window.navigator.userAgent).getPlatformType(true);
  return platform === 'mobile';
}

export function getBrowserName(): Browser {
  return Bowser.getParser(window.navigator.userAgent).getBrowserName() as Browser;
}

export function isAllowedCurrentBrowser() {
  return [Browser.CHROME, Browser.FIREFOX].includes(getBrowserName());
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
    case TxStatusType.FLYOVER_PEGIN:
      switch (status) {
        case constants.FlyoverStatus.PENDING:
          statusMessage = 'Your peg-in is being processed';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case constants.FlyoverStatus.SUCCESS:
          statusMessage = 'Your transaction was successfully processed!';
          activeMessageStyle = 'statusSuccess';
          isRejected = false;
          break;
        default:
      }
      break;
    case TxStatusType.FLYOVER_PEGOUT:
      switch (status) {
        case constants.FlyoverStatus.PENDING:
          statusMessage = 'Your peg-out is being processed';
          activeMessageStyle = 'statusProgress';
          isRejected = false;
          break;
        case constants.FlyoverStatus.SUCCESS:
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
      errorMessage = 'The hash does not match any PowPeg operation.';
      break;
    case TxStatusType.UNSET_STATUS:
      activeMessageStyle = 'statusProgress';
      break;
    case TxStatusType.UNEXPECTED_ERROR:
      activeMessageStyle = 'statusRejected';
      error = true;
      errorMessage = 'The input transaction is not valid, please check it and try again';
      break;
    case TxStatusType.BLOCKBOOK_FAILED:
      activeMessageStyle = 'statusRejected';
      error = true;
      errorMessage = 'Blockbook service is not responding';
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

export function blockConfirmationsToTimeString(confirmations: number, chain: 'btc' | 'rsk' = 'rsk'): string {
  const timeInSeconds = chain === 'btc' ? constants.BTC_AVG_BLOCK_TIME_IN_SECONDS : constants.RSK_AVG_BLOCK_TIME_IN_SECONDS;
  return moment.duration(confirmations * timeInSeconds, 'seconds').humanize(false, { h: 34 });
}

export function awaitTimeout(ms: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, ms);
  });
}

export function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([promise, awaitTimeout(timeoutMs)]);
}

export function truncateString(str: string) {
  if (!str) return '';
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

export function truncateStringToSize(str: string, size: number) {
  if (!str) return '';
  if (str.length <= size) return str;
  return `${str.slice(0, size / 2)}...${str.slice(-size / 2)}`;
}

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}

export function isValidSiteKey(siteKey: string): boolean {
  const siteKeyPattern = /^[A-Za-z0-9_-]+$/;
  return siteKeyPattern.test(siteKey);
}

export function appendRecaptcha(siteKey: string): void {
  if (!isValidSiteKey(siteKey)) {
    return;
  }
  const scriptTag = document.createElement('script');
  scriptTag.type = 'text/javascript';
  scriptTag.async = true;
  scriptTag.defer = true;
  scriptTag.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  document.head.appendChild(scriptTag);
  const captchaDiv = document.createElement('div');
  captchaDiv.id = 'recaptcha';
  captchaDiv.className = 'g-recaptcha';
  captchaDiv.setAttribute('data-sitekey', siteKey);
  captchaDiv.setAttribute('data-callback', 'onRecaptchaSuccess');
  captchaDiv.setAttribute('data-action', 'submit');
  captchaDiv.setAttribute('data-size', 'invisible');
  document.body.appendChild(captchaDiv);
}
