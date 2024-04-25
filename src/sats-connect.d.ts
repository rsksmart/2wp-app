declare module 'sats-connect' {

    export type AddressPurpose = 'ordinals' | 'payment';
    export enum BitcoinNetworkType { 'Mainnet', 'Testnet' }

    interface MethodParamsAndResult<TParams, TResult> {
        params: TParams;
        result: TResult;
    }

    interface Address {
        address: string;
        publicKey: string;
        purpose?: AddressPurpose;
        addressType?: AddressType;
    }

    type GetAddressesParams = {
        /**
         * The purposes for which to generate addresses.
         * possible values are "payment", "ordinals", ...
         */
        purposes: Array<AddressPurpose>;
        /**
         * a message to be displayed to the user in the request prompt.
         */
        message?: string;
    };

    type GetAddressesResult = {
        addresses: Array<Address>;
    };

    type SignPsbtParams = {
        /**
         * The base64 encoded PSBT to sign.
         */
        psbt: string;
        /**
         * The inputs to sign.
         * The key is the address and the value is an array of indexes of the inputs to sign.
         */
        signInputs: Record<string, number[]>;
        /**
         * the sigHash type to use for signing.
         * will default to the sighash type of the input if not provided.
         * */
        allowedSignHash?: number;
        /**
         * Whether to broadcast the transaction after signing.
         * */
        broadcast?: boolean;
    };
    type SignPsbtResult = {
        /**
         * The base64 encoded PSBT after signing.
         */
        psbt: string;
        /**
         * The transaction id as a hex-encoded string.
         * This is only returned if the transaction was broadcast.
         * */
        txid?: string;
    };

    type GetAddresses = MethodParamsAndResult<GetAddressesParams, GetAddressesResult>;
    type SignPsbt = MethodParamsAndResult<SignPsbtParams, SignPsbtResult>;

    interface BtcRequests {
        getAddresses: GetAddresses;
        signPsbt: SignPsbt;
    }

    export type Response = {
        status: 'error';
        error: {
            message: string;
        };
    }| {
        status: 'success';
        result: {
            addresses: {
                address: string;
                publicKey: string;
            }[];
        };
    }

    type Params<Method> = Method extends keyof BtcRequests ? BtcRequests[Method]['params'] : never;

    type RpcResult<Method extends keyof BtcRequests> = {
        result: RpcSuccessResponse<Method>['result'];
        status: 'success';
    } | {
        error: RpcErrorResponse['error'];
        status: 'error';
    };

    export default class Wallet {
      static request<Method extends keyof BtcRequests>(method: Method, params: Params<Method>)
      : Promise<RpcResult<Method>>;
    }
}
