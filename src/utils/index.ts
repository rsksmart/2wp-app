export const getChunkedValue = (value: string) => `${value.substr(0, 6)}...${value.substr(value.length - 6, value.length)}`;
