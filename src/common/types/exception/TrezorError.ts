export class TrezorError extends Error {
  public urlToMoreInformation = 'https://trezor.io/';

  public errorType = 'Trezor';

  public messageToUserOnLink = 'Click here to know how to use Trezor';

  constructor(message?: string) {
    super(message || 'Trezor hardware wallet is not recognized');
  }
}
