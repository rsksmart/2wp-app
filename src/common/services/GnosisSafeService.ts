import SafeApiKit, { SafeInfoResponse } from '@safe-global/api-kit';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData, OperationType, SafeTransaction } from '@safe-global/safe-core-sdk-types';
import { EnvironmentAccessorService } from './enviroment-accessor.service';
import { WeiBig } from '../types';

export default class GnosisSafeService {
    apiKit: SafeApiKit;

    protocolKit: Safe;

    constructor() {
      const { chainId, safeTxServiceUrl } = EnvironmentAccessorService.getEnvironmentVariables();
      this.apiKit = new SafeApiKit({
        chainId: BigInt(chainId),
        txServiceUrl: safeTxServiceUrl,
      });
      this.protocolKit = new Safe();
    }

    public init(signerAddress: string, safeAddress: string): Promise<void> {
      return new Promise((resolve, reject) => {
        Safe.init({
          provider: window.ethereum,
          signer: signerAddress,
          safeAddress,
        })
          .then((kit) => {
            this.protocolKit = kit;
            resolve();
          })
          .catch(reject);
      });
    }

    getSafeAccounts(address: string): Promise<Array<string>> {
      return new Promise((resolve, reject) => {
        this.apiKit.getSafesByOwner(address)
          .then((safesAccounts) => {
            console.log(safesAccounts);
            resolve(safesAccounts.safes);
          })
          .catch(reject);
      });
    }

    getSafeInfo(safeAddress: string): Promise<SafeInfoResponse> {
      return this.apiKit.getSafeInfo(safeAddress);
    }

    private createTx(amount: WeiBig, to: string): Promise<SafeTransaction> {
      return new Promise((resolve, reject) => {
        const safeTransactionData: MetaTransactionData = {
          to,
          value: amount.toWeiString(),
          data: '0x',
          operation: OperationType.Call,
        };
        this.protocolKit.createTransaction({
          transactions: [safeTransactionData],
        })
          .then(resolve)
          .catch(reject);
      });
    }

    proposeTx(amount: WeiBig, to: string, safeAddress: string, senderAddress: string)
    : Promise<void> {
      return new Promise<void>((resolve, reject) => {
        let safeTx: SafeTransaction;
        this.createTx(amount, to)
          .then((safeTransaction) => {
            safeTx = safeTransaction;
            return this.protocolKit.getTransactionHash(safeTransaction);
          })
          .then((txHash) => Promise.all([this.protocolKit.signHash(txHash), txHash]))
          .then(([signature, safeTxHash]) => this.apiKit.proposeTransaction({
            safeAddress,
            safeTransactionData: safeTx.data,
            safeTxHash,
            senderAddress,
            senderSignature: signature.data,
          }))
          .then(resolve)
          .catch(reject);
      });
    }
}
