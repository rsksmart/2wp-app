import { createConfig, http } from '@wagmi/vue';
import { rootstock, rootstockTestnet } from '@wagmi/vue/chains';
import {
  injected,
  walletConnect,
  metaMask,
  safe,
} from '@wagmi/connectors';

export const projectId = 'aef4564feb7de6f88effc174183bbdb4'; // wallet connect project id

export const config = createConfig({
  chains: process.env.VUE_APP_COIN === 'Mainnet' ? [rootstock] : [rootstockTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [rootstock.id]: http('https://public-node.rsk.co'),
    [rootstockTestnet.id]: http('https://public-node.testnet.rsk.co'),
  },
});
