import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { SatoshiBig } from '@/common/types';
import BalanceService from '@/pegin/services/BalanceService';
import axios from 'axios';
import sinon from 'sinon';

const API_URL = 'https://api.url';

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: API_URL,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}

describe('Balance Service', () => {
  beforeEach(setEnvironment);
  afterEach(() => {
    sinon.restore();
  });

  it.only('should resolve a balance with a list of UTXOs for each address type', () => {
    const legacyAddresses = [
      { address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1', derivationPath: '', publicKey: '' },
      { address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV', derivationPath: '', publicKey: '' }];
    const segwitAddresses = [
      { address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs', derivationPath: '', publicKey: '' },
      { address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C', derivationPath: '', publicKey: '' }];
    const nativeSegwitAddresses = [
      { address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0', derivationPath: '', publicKey: '' },
      { address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr', derivationPath: '', publicKey: '' }];
    const addresses = [...legacyAddresses, ...segwitAddresses, ...nativeSegwitAddresses];

    const legacyApiResponse = {
      data: [{
        txid: '', vout: 0, value: '500000', confirmations: 0,
      },
      {
        txid: '', vout: 0, value: '400000', confirmations: 0,
      }],
    };
    const segwitApiResponse = { data: [] };
    const nativeSegwitApiResponse = { data: [] };

    sinon.stub(axios, 'post').withArgs(`${API_URL}/utxo`, { addressList: legacyAddresses.map(({ address }) => address) }).resolves(legacyApiResponse);
    sinon.stub(axios, 'post').withArgs(`${API_URL}/utxo`, { addressList: segwitAddresses.map(({ address }) => address) }).resolves(segwitApiResponse);
    sinon.stub(axios, 'post').withArgs(`${API_URL}/utxo`, { addressList: nativeSegwitAddresses.map(({ address }) => address) }).resolves(nativeSegwitApiResponse);

    const balances = {
      legacy: { balance: new SatoshiBig('900000', 'satoshi'), utxos: legacyApiResponse.data },
      segwit: { balance: new SatoshiBig('0', 'satoshi'), utxos: segwitApiResponse.data },
      nativeSegwit: { balance: new SatoshiBig('0', 'satoshi'), utxos: nativeSegwitApiResponse.data },
    };

    expect(BalanceService.getBalances(addresses)).resolves.toStrictEqual(balances);
  });
});
