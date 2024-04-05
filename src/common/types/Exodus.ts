export {};

declare global {

    enum AddressPurposes {
        PAYMENT = 'payment',
        ORDINALS = 'ordinals'
    }

    interface Address {
        address: string;
        publicKey: string;
        purpose: AddressPurposes;
    }

    interface GetAddressPayload {
        purposes: Array<AddressPurposes>;
        message: string;
    }

    interface GetAddressResponse {
        addresses: Array<Address>;
    }

}
