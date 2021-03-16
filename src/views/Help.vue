<template>
  <div class="exchange">
    <div class="container">
      <confirm-transaction :txData="txData" :price="52179.73" :txId="txId"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import TrezorService from '@/services/TrezorService';
import { UnusedWalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { FeeAmountData, TrezorTx } from '@/services/types';
import ConfirmTransaction from '@/components/trezor/ConfirmTransaction.vue';
import TrezorTxBuilder from '@/services/TrezorTxBuilder';

@Component({
  components: {
    ConfirmTransaction,
  },
})
export default class Help extends Vue {
  txId = 'e775bc7b79af4e6133be5c28fed84b5a2415af2bdc780bfae8f48f51d813560b';

  trezorService: TrezorService = new TrezorService('test');

  txBuilder: TrezorTxBuilder = new TrezorTxBuilder();

  addresses: UnusedWalletAddress[] = [];

  bitcoinWallet = 'WALLET_TREZOR';

  calculatedFees: FeeAmountData = {
    slow: 0,
    average: 0,
    fast: 0,
  };

  balances = {
    segwit: 50000,
    nativeSegwit: 49997000,
    legacy: 3289478,
  };

  amount = 1000000;

  refundAddress = '2N6jtRGNMkdSXnCKk3zG5s33KWhnbfDehkZ';

  recipient = '0x9c4aAE754FF8c963966B26CE8206EF0271c614aa';

  feeBTC = 0.01561;

  change = '2N2U4VZT1pjjXsLq9kgUQwwNNRP5bimtnak';

  address = [
    {
      path: [2147483692, 2147483649, 2147483648, 0, 0],
      serializedPath: "m/44'/1'/0'/0/0",
      address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
    },
    {
      path: [2147483692, 2147483649, 2147483648, 1, 0],
      serializedPath: "m/44'/1'/0'/1/0",
      address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV',
    },
    {
      path: [2147483697, 2147483649, 2147483648, 0, 0],
      serializedPath: "m/49'/1'/0'/0/0",
      address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
    },
    {
      path: [2147483697, 2147483649, 2147483648, 1, 0],
      serializedPath: "m/49'/1'/0'/1/0",
      address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C',
    },
    {
      path: [2147483732, 2147483649, 2147483648, 0, 0],
      serializedPath: "m/84'/1'/0'/0/0",
      address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0',
    },
    {
      path: [2147483732, 2147483649, 2147483648, 1, 0],
      serializedPath: "m/84'/1'/0'/1/0",
      address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr',
    },
    {
      path: [2147483692, 2147483649, 2147483648, 0, 1],
      serializedPath: "m/44'/1'/0'/0/1",
      address: 'mu3fMm1zoMYt8LureScmXMSbMNE2nqx7dA',
    },
    {
      path: [2147483692, 2147483649, 2147483648, 1, 1],
      serializedPath: "m/44'/1'/0'/1/1",
      address: 'n1CfunLraRXEUgq6qFeekgHMhim9hMXZH7',
    },
    {
      path: [2147483697, 2147483649, 2147483648, 0, 1],
      serializedPath: "m/49'/1'/0'/0/1",
      address: '2N1PDkBbjeampkMVSNm5oxj6bR1f9BCZaXU',
    },
    {
      path: [2147483697, 2147483649, 2147483648, 1, 1],
      serializedPath: "m/49'/1'/0'/1/1",
      address: '2N3MwqmCeEiggLDrUeSmD4D384JNrieoXBV',
    },
    {
      path: [2147483732, 2147483649, 2147483648, 0, 1],
      serializedPath: "m/84'/1'/0'/0/1",
      address: 'tb1q2990uulszda0g2qwluw3ry22cs452lpfaty965',
    },
    {
      path: [2147483732, 2147483649, 2147483648, 1, 1],
      serializedPath: "m/84'/1'/0'/1/1",
      address: 'tb1qymmqueltl38pz7zye5nqygwlvcy43ay4euj394',
    },
  ];

  createdTx: TrezorTx = {
    coin: process.env.VUE_APP_COIN ?? 'test',
    inputs: [],
    outputs: [],
  };

  get txData() {
    return {
      amount: this.amount,
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: this.feeBTC,
      change: this.change,
    };
  }

  @Emit()
  toConfirmTx() {
    this.txBuilder.buildTx({
      amountToTransferInSatoshi: 1000000,
      refundAddress: '2N6jtRGNMkdSXnCKk3zG5s33KWhnbfDehkZ',
      recipient: '0x9c4aAE754FF8c963966B26CE8206EF0271c614aa',
      feeLevel: 'BITCOIN_AVERAGE_FEE_LEVEL',
      changeAddress: '2N2U4VZT1pjjXsLq9kgUQwwNNRP5bimtnak',
      sessionId: 'f052a98df7bbce9f237e63db47acfe7f',
    })
      .then((tx: TrezorTx) => {
        this.createdTx = tx;
      })
      .catch(console.error);
  }

  @Emit()
  getAccountAddresses() {
    this.trezorService.getAccountUnusedAddresses(constants.BITCOIN_SEGWIT_ADDRESS)
      .then((addresses) => {
        console.log(addresses);
      })
      .catch(console.error);
  }

  created() {
    this.toConfirmTx();
  }
}
</script>
