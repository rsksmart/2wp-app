export class ExodusError extends Error {
    public urlToMoreInformation = 'https://www.exodus.com/';

    public errorType = 'Exodus';

    public installationLink = 'https://www.exodus.com/';

    public messageInstallationToUser = 'Install Exodus';

    public messageToUserOnLink = 'Click here to know how to use Exodus';

    constructor(message?: string) {
      super(message || 'Exodus software wallet is not installed on your browser');
    }
}
