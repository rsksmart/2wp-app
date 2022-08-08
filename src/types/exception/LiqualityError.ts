export class LiqualityError extends Error {
  constructor() {
    const message = 'Liquality software wallet not installed on your browser </br> <a target=\'_blank\' href=\'https://developers.rsk.co/solutions/liquality/\'/>Click here to know how to enable liquality.</a>';
    super(message);
  }
}
