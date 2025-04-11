import { providers, utils } from 'ethers';
import { TransactionRequest, TransactionResponse } from '@/common/types';

export const sendTransaction = (
  transaction:TransactionRequest,
  provider: providers.Web3Provider,
): Promise<TransactionResponse> => {
  const signer = provider.getSigner();
  return signer.sendUncheckedTransaction(transaction).then((hash) => ({
    hash,
    nonce: null,
    gasLimit: null,
    gasPrice: null,
    data: null,
    value: null,
    chainId: null,
    confirmations: 0,
    from: '',
    wait: (confirmations?: number) => provider.waitForTransaction(hash, confirmations),
  }));
};

export const toSatoshiBigIntString = (userFormatedValue: string) : string => utils
  .parseUnits(userFormatedValue, 8).toString();

export const toWeiBigIntString = (userFormatedValue: string) : string => utils
  .parseUnits(userFormatedValue, 18).toString();

export const bigNumberToSatoshiBigIntString = (bigIntString: string) : string => utils
  .formatUnits(BigInt(bigIntString), 8);
