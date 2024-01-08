export class EnkryptError extends Error {
    public urlToMoreInformation = 'https://www.enkrypt.com/';

    public errorType = 'Enkrypt';

    public installationLink = 'https://www.enkrypt.com/';

    public messageInstallationToUser = 'Install Enkrypt';

    public messageToUserOnLink = 'Click here to know how to use Enkrypt';

    constructor(message?: string) {
      super(message || 'Enkrypt software wallet is not installed on your browser');
    }
}
