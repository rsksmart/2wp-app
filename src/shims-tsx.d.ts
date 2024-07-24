import Vue, { VNode } from 'vue';
import { LeatherProvider } from '@leather.io/rpc';

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
  }
}
