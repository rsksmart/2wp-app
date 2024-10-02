/* eslint-disable class-methods-use-this */
import { createUnsecuredToken, Json } from 'jsontokens';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/common/store/constants';
import {
  WalletAddress, Tx, SignedTx, BtcAccount,
  AddressPurposes,
  GetAddressPayload,
  GetAddressResponse,
  BitcoinProvider,
  SignTransactionPayload,
  InputToSign,
  ExodusTx,
} from '../types';
import WalletService from './WalletService';

export default class ExodusService extends WalletService {
  provider: BitcoinProvider;

  constructor() {
    super();
    this.provider = window.BitcoinProvider;
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const payload: GetAddressPayload = {
        purposes: [AddressPurposes.PAYMENT],
      };
      console.log('payload', payload);
      const request = createUnsecuredToken(payload as unknown as Json);
      console.log('request', request);
      this.provider.connect(request)
        .then((response: GetAddressResponse) => {
          console.log('AddressResponse', response);
          const addresses: WalletAddress[] = response.addresses.map((addressObj) => ({
            address: addressObj.address,
            derivationPath: '',
            publicKey: addressObj.publicKey,
          }));
          resolve(addresses);
        })
        .catch(reject);
    });
  }

  sign(tx: Tx): Promise<SignedTx> {
    const exodusTx = tx as ExodusTx;
    return new Promise<SignedTx>((resolve, reject) => {
      const inputsToSign: Array<InputToSign> = [];
      exodusTx.inputs.forEach((input: { address: string; idx: number; }, inputIdx: number) => {
        const idx = inputsToSign.findIndex((inputToSign) => inputToSign.address === input.address);
        if (idx >= 0) {
          inputsToSign[idx].signingIndexes.push(inputIdx);
        } else {
          inputsToSign.push({
            address: input.address,
            signingIndexes: [inputIdx],
          });
        }
      });
      const payload: SignTransactionPayload = {
        psbtBase64: exodusTx.base64UnsignedPsbt,
        inputsToSign,
        broadcast: false,
      };
      const request = createUnsecuredToken(payload as unknown as Json);
      this.provider.signTransaction(request)
        .then((response) => {
          const signedPsbt = bitcoin.Psbt.fromBase64(response.psbtBase64);
          if (!signedPsbt.validateSignaturesOfAllInputs()) {
            reject(new Error('Invalid signature provided'));
          } else {
            resolve({
              signedTx: signedPsbt.finalizeAllInputs().extractTransaction().toHex(),
            });
          }
        })
        .catch(() => reject(new Error('Invalid psbt provided')));
    });
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(true);
  }

  reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getAccountAddresses()
        .then(() => resolve())
        .catch(reject);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    throw new Error('Method not implemented.');
  }

  areEnoughUnusedAddresses(): boolean {
    return this.addressesToFetch.nativeSegwit.lastIndex >= 1;
  }

  name(): Record<'formal_name' | 'short_name' | 'long_name', string> {
    return constants.WALLET_NAMES.EXODUS;
  }

  availableAccounts(): Array<BtcAccount> {
    return [constants.BITCOIN_NATIVE_SEGWIT_ADDRESS];
  }
}
