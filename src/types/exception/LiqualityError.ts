export class LiqualityError extends Error {
  public urlToMoreInformation = 'https://developers.rsk.co/solutions/liquality';

  public errorType = 'Liquality';

  public messageToUserOnLink = 'Click here to know how to enable Liquality';

  constructor() {
    super('Liquality software wallet not installed on your browser');
  }
}
