// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TrezorConnect {
  /**
   * Set TrezorConnect manifest.
   */
  // eslint-disable-next-line max-len
  // eslint-disable-next-line no-inner-declarations,@typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  function manifest(params): void {}
  /**
   * Bitcoin and Bitcoin-like
   * Display requested address derived by given BIP32 path on device and
   * returns it to caller. User is asked to confirm the export on Trezor.
   */
  function getAddress(params: P.CommonParams & Bitcoin.GetAddress): P.Response<Bitcoin.Address>;

  /**
   * Bitcoin and Bitcoin-like
   * Retrieves BIP32 extended public derived by given BIP32 path.
   * User is presented with a description of the requested key and asked to
   * confirm the export.
   */
  function getPublicKey(params: P.CommonParams & Bitcoin.GetPublicKey):
    P.Response<Bitcoin.HDNodeResponse>;
  /**
   * Bitcoin and Bitcoin-like
   * Asks device to sign given inputs and outputs of pre-composed transaction.
   * User is asked to confirm all transaction details on Trezor.
   */
  function signTransaction(params: P.CommonParams & Bitcoin.SignTransaction):
    P.Response<Bitcoin.SignedTransaction>;

  /**
   * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
   * Gets an info of specified account.
   */
  function getAccountInfo(params: P.CommonParams & Account.GetAccountInfo):
    P.Response<Account.AccountInfo>;

}
