export default class FireblocksService {
  private apiKey: string;

  private cert: File;

  constructor(apiKey: string, cert:File) {
    this.apiKey = apiKey;
    this.cert = cert;
  }
}
