import { providers, utils, BigNumber } from 'ethers';
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

export const bigIntToUserFormattedSatoshi = (bigIntString: string) : string => {
  const formattedBigInt = bigIntString.length > 8
    ? bigIntString.slice(0, 8) : bigIntString;
  return utils.formatUnits(BigInt(formattedBigInt), 8);
};

export const bigNumberToWeiBigIntString = (bignumber: BigNumber | null)
  : string => (bignumber === BigNumber.from(0) || !bignumber
  ? '0' : utils.formatUnits(bignumber, 18));

export const bigIntToUserFormattedWei = (bigIntString: string) : string => utils
  .formatUnits(BigInt(bigIntString), 18);

export const bigIntWeiToBigIntSatoshi = (bigIntWeiString: string) : string => utils
  .parseUnits(bigIntToUserFormattedSatoshi(bigIntWeiString), 8).toString();
