export enum AddressPurposes {
    PAYMENT = 'payment',
    ORDINALS = 'ordinals'
}

export interface Address {
    address: string;
    publicKey: string;
    purpose: AddressPurposes;
}

export interface GetAddressPayload {
    purposes: Array<AddressPurposes>;
    message?: string;
}

export interface GetAddressResponse {
    addresses: Array<Address>;
}

export interface SignTransactionResponse {
    psbtBase64: string;
    txId?: string;
  }

export interface InputToSign {
    address: string;
    signingIndexes: number[];
    sigHash?: number;
}

export type PsbtPayload = {
    psbtBase64: string;
    inputsToSign: InputToSign[];
    broadcast?: boolean;
};

export interface SignTransactionPayload extends PsbtPayload {
    message?: string;
}

export interface BitcoinProvider {
    connect: (request: string) => Promise<GetAddressResponse>
    signTransaction: (request: string) => Promise<SignTransactionResponse>
    signMessage: (request: string) => Promise<string>
}
