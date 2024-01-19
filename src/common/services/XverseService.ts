/* eslint-disable class-methods-use-this */
import {
  getAddress, AddressPurpose, BitcoinNetworkType,
  GetAddressResponse, signTransaction, SignTransactionResponse,
} from 'sats-connect';
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
      console.log('XverseService.getAccountAddresses()');
      return new Promise<WalletAddress[]>((resolve, reject) => {
        const walletAddresses: WalletAddress[] = [];
        const payload = {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          message: '2wp app balance',
          network: {
            type: this.satsBtcNetwork,
          },
        };
        getAddress({
          payload,
          onFinish: (response: GetAddressResponse) => {
            const { addresses } = response;
            addresses.forEach((address, idx) => {
              const walletAddress: WalletAddress = {
                address: address.address,
                publicKey: address.publicKey,
                derivationPath: `${address.purpose}/${idx}`,
              };
              walletAddresses.push(walletAddress);
            });
            console.log('XverseService.getAccountAddresses() onFinish', walletAddresses);
            resolve(walletAddresses);
          },
          onCancel: () => {
            reject(new Error('User cancelled'));
          },
        });
      });
    }

    sign(tx: Tx): Promise<SignedTx> {
      const xverseTx = tx as XverseTx;
      return new Promise<SignedTx>((resolve, reject) => {
        const signPsbtOptions = {
          payload: {
            network: {
              type: this.satsBtcNetwork,
            },
            message: 'Sign Transaction',
            psbtBase64: xverseTx.base64UnsignedPsbt,
            broadcast: false,
            inputsToSign: xverseTx.inputs.map((input) => ({
              address: input.address,
              signingIndexes: [input.idx],
            })),
          },
          onFinish: (response: SignTransactionResponse) => {
            console.log(response.psbtBase64);
            const signedPsbt = bitcoin.Psbt.fromBase64(response.psbtBase64 as string);
            if (!signedPsbt.validateSignaturesOfAllInputs()) {
              reject(new Error('Invalid signature provided'));
            } else {
              resolve({
                signedTx: signedPsbt.finalizeAllInputs().extractTransaction().toHex(),
              });
            }
          },
          onCancel: () => reject(new Error('User declined transaction sign')),
        };
        signTransaction(signPsbtOptions);
      });
    }

    isConnected(): Promise<boolean> {
      console.log('XverseService.isConnected()');
      return Promise.resolve(true);
    }

    reconnect(): Promise<void> {
      console.log('XverseService.reconnect()');
      throw new Error('Method not implemented.');
    }

    getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
      console.log('XverseService.getXpub()', accountType, accountNumber);
      throw new Error('Method not implemented.');
    }

    areEnoughUnusedAddresses(): boolean {
      console.log('XverseService.areEnoughUnusedAddresses()');
      return this.adjacentUnusedAddresses.nativeSegwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES;
    }

    name(): string {
      return constants.WALLET_NAMES.XVERSE;
    }

    availableAccounts(): BtcAccount[] {
      return [constants.BITCOIN_NATIVE_SEGWIT_ADDRESS];
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
              address: false,
              amount: true,
            },
            federation: {
              address: true,
              amount: true,
            },
          },
          fee: true,
        },
      ];
    }
}
