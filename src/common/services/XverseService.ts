/* eslint-disable class-methods-use-this */
import Wallet, { AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import * as bitcoin from 'bitcoinjs-lib';
import { WalletService } from '@/common/services/index';
import * as constants from '@/common/store/constants';
import { XverseTx } from '@/pegin/middleware/TxBuilder/XverseTxBuilder';
import {
  WalletAddress, Tx, SignedTx, BtcAccount, Step,
} from '../types';

export default class XverseService extends WalletService {
      satsBtcNetwork: BitcoinNetworkType;

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

      getAccountAddresses(): Promise<WalletAddress[]> {
        return new Promise<WalletAddress[]>((resolve, reject) => {
          const walletAddresses: WalletAddress[] = [];
          const payload = {
            purposes: ['ordinals', 'payment'] as AddressPurpose[],
            message: 'Welcome to the 2wp-app, please select your Bitcoin account to start.',
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
          xverseTx.inputs.forEach((input: { address: string | number; idx: number; }) => {
            signInputs[input.address] = [input.idx];
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
            .catch(() => reject(new Error('Unable to sign transaction')));
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
        return [constants.BITCOIN_SEGWIT_ADDRESS];
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
