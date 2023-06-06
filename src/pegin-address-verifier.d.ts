declare module 'pegin-address-verifier' {

  function getAddressInformation(address: string):
  {type: string; network: string; scriptPubKey: string};

  export {
    getAddressInformation,
  };
}
