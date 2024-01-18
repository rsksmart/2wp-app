/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    btc: {
      request(
        method: any,
        params?: Record<string, any>
      ): Promise<any>
    }
  }
}
