import { sha256Hex } from './jwtBuilder';

/**
 * Generates a unique external transaction ID based on params, timestamp, and random value
 * @param params - The transaction parameters object
 * @returns A unique transaction ID string
 */
export function generateExternalTxId(params: object): Promise<string> {
  const timestamp = Date.now().toString();
  const { crypto } = window;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0].toString(36).substring(2, 15);
  const paramsString = JSON.stringify(params);

  const combinedString = `${paramsString}-${timestamp}-${randomValue}`;
  return sha256Hex(combinedString);
}
