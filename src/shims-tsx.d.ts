import Vue, { VNode } from 'vue';
import { LeatherProvider } from '@leather.io/rpc';
import EnkryptWindow from '@enkryptcom/types';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: never;
    }
  }
}

declare global {
  interface Ethereum {
    on(eventName: string, cb: () => never);
    isMetamask: boolean;
  }
  interface Window {
    ethereum: Ethereum,
    LeatherProvider?: LeatherProvider,
    enkrypt?: EnkryptWindow,
    grecaptcha: {
      ready: (cb: () => void) => void,
      execute: () => Promise<string>,
      getResponse: () => string,
    },
    onRecaptchaSuccess: () => Promise<void>,
  }
  interface EnkryptProvider {
    getAccounts(): Promise<string[]>;
  }
}
