export function getPubKeyFromRskSignedMessage(signedMessage:string): string {
  const r = signedMessage.slice(0, 66);
  const s = `0x${signedMessage.slice(66, 130)}`;
  const v = parseInt(signedMessage.slice(130, 132), 16);
  return '';
}
