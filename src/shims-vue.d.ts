/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import Web3 from 'web3';
const web3 = new Web3();
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $web3: typeof web3;
  }
}