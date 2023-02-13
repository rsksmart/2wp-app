export class LiqualityError extends Error {
  public urlToMoreInformation = 'https://developers.rsk.co/solutions/liquality';

  public errorType = 'Liquality';

  public installationLink = 'https://liquality.io/';

  public messageInstallationToUser = 'Install Liquality';

  public messageToUserOnLink = 'Click here to know how to use Liquality';

  constructor(message?: string) {
    super(message || 'Liquality software wallet is not installed on your browser');
  }
}
