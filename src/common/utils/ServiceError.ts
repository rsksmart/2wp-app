export default class ServiceError extends Error {
  public serviceName: string;

  public userMessage: string;

  public technicalMessage: string;

  public triggeredByMethod: string;

  constructor(
    serviceName: string,
    triggeredByMethod: string,
    userMessage: string,
    technicalMessage: string,
  ) {
    super(userMessage);
    this.serviceName = serviceName;
    this.triggeredByMethod = triggeredByMethod;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
  }
}
