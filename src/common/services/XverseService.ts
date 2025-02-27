/* eslint-disable class-methods-use-this */
import Wallet, { AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import * as bitcoin from 'bitcoinjs-lib';
import { WalletService } from '@/common/services/index';
import * as constants from '@/common/store/constants';
import {
  WalletAddress, Tx, SignedTx, BtcAccount, Step,
  XverseTx,
} from '../types';
import { validateAddress } from '../utils';

export default class XverseService extends WalletService {
  satsBtcNetwork: BitcoinNetworkType;

  btcAccounts: BtcAccount[] = [];

  constructor() {
    super();
    switch (this.network) {
      case constants.BTC_NETWORK_MAINNET:
        this.satsBtcNetwork = BitcoinNetworkType.Mainnet;
        break;
      default:
        this.satsBtcNetwork = BitcoinNetworkType.Testnet;
        break;
    }
  }

  async getAccountAddresses(): Promise<WalletAddress[]> {
    // @ts-expect-error method type not provided
    const permissions = await Wallet.request('wallet_getCurrentPermissions', undefined);
    if (permissions.status !== 'success') {
      // @ts-expect-error method type not provided
      await Wallet.request('wallet_requestPermissions', undefined);
    }
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      const payload = {
        purposes: ['payment'] as AddressPurpose[],
        message: 'Welcome to the Powpeg app, please select your Bitcoin account to start.',
        network: {
          type: this.satsBtcNetwork,
        },
      };
      Wallet.request('getAddresses', payload)
        .then((response) => {
          if (response.status === 'error') {
            reject(new Error(response.error.message));
          } else {
            response.result.addresses
              .forEach((addr: { address: string; publicKey: string; }) => {
                walletAddresses.push({
                  address: addr.address,
                  publicKey: addr.publicKey,
                  derivationPath: '',
                });
                const { addressType } = validateAddress(addr.address);
                this.btcAccounts.push(addressType as BtcAccount);
              });
          }
          resolve(walletAddresses);
        })
        .catch(reject);
    });
  }

  sign(tx: Tx): Promise<SignedTx> {
    const xverseTx = tx as XverseTx;
    return new Promise<SignedTx>((resolve, reject) => {
      const signInputs: Record<string, number[]> = {};
      xverseTx.inputs.forEach((input: { address: string; idx: number; }, inputIdx: number) => {
        if (signInputs[input.address]) {
          signInputs[input.address].push(inputIdx);
        } else {
          signInputs[input.address] = [inputIdx];
        }
      });
      const signPsbtOptions = {
        psbt: xverseTx.base64UnsignedPsbt,
        signInputs,
        broadcast: false,
      };
      Wallet.request('signPsbt', signPsbtOptions)
        .then((response) => {
          if (response.status === 'error') {
            reject(new Error(response.error.message));
          } else {
            const signedPsbt = bitcoin.Psbt.fromBase64(response.result.psbt as string);
            if (!signedPsbt.validateSignaturesOfAllInputs()) {
              reject(new Error('Invalid signature provided'));
            } else {
              resolve({
                signedTx: signedPsbt.finalizeAllInputs().extractTransaction().toHex(),
              });
            }
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
    throw new Error('Method not supported.');
  }

  areEnoughUnusedAddresses(): boolean {
    return this.addressesToFetch.segwit.lastIndex >= 1;
  }

  availableAccounts(): BtcAccount[] {
    return this.btcAccounts;
  }

  name(): Record<'formal_name' | 'short_name' | 'long_name', string> {
    return constants.WALLET_NAMES.XVERSE;
  }

  confirmationSteps(): Step[] {
    return [
      {
        title: 'Transaction information',
        subtitle: '',
        outputsToshow: {
          opReturn: {
            value: false,
            amount: true,
          },
          change: {
            address: true,
            amount: true,
          },
          federation: {
            address: true,
            amount: true,
          },
        },
        fullAmount: false,
        fee: true,
      },
    ];
  }
}
