/* eslint-disable */
import { NormalizedInput, NormalizedOutput } from '@/types';
import ApiService  from '@/services/ApiService';
import axios, { AxiosResponse } from 'axios';
import sinon from 'sinon';
import { expect } from 'chai';
import { BridgeService } from '@/services/BridgeService';
import * as PowPegAddressUtils from '@/services/PowPegAddressUtils';
import * as OpReturnUtils from '@/services/OpReturnUtils';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import { WalletService } from '@/services/WalletService';
import LedgerService from '@/services/LedgerService';

// function getNormalizedTx(): Promise<AxiosResponse> {
//     return new Promise<AxiosResponse>((resolve) => {
//        const outputs: NormalizedOutput[] = [
//          {
//            address : 'powPegAddress',
//            address_n: [0],
//            amount: '1',
//            serializedValue: '',
//          },
//          {
//            address : 'changeAddress',
//            address_n: [],
//            amount: '0.1',
//            serializedValue: '',
//            op_return_data : 'test1',
//          },
//          {
//            address : '',
//            address_n: [],
//            amount: '0',
//            serializedValue: '',
//            op_return_data : 'test1',
//          }
//        ];
//        const inputs: NormalizedInput[] = [];
//        resolve(
//          {data:
//               {
//                 coin: '0',
//                 inputs: inputs,
//                 outputs: outputs,
//               },
//          status: 200,
//          statusText: 'OK',
//          headers: {},
//          config: {}
//         });
//       })
// };

// function setEnvironment(isValidOpReturn: boolean, isValidPowPegAddress?: boolean) {
//   let defaultEnvironmentVariables = {
//     vueAppCoin: constants.BTC_NETWORK_TESTNET,
//     vueAppRskNodeHost: '',
//   };
//   EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
//   sinon.stub(BridgeService.prototype, 'getFederationAddress').resolves('powPegAddress');
//   sinon.stub(axios, 'post').resolves(getNormalizedTx());
//   sinon.stub(OpReturnUtils, 'isValidOpReturn').returns(isValidOpReturn);
//   if (isValidPowPegAddress) {
//     sinon.stub(PowPegAddressUtils, 'isValidPowPegAddress').returns(isValidPowPegAddress);
//   }
// };

function isLoadingBalances(): boolean {  
  let counter = 0;
  let stop = 20;
  if (counter < stop) {
    counter++;
    return true;
  }
  return false; 
}

describe('function: stopAskingForBalance', () => {

  afterEach(function () {
    sinon.restore();
  });

  it('balance stoped at the begining', async () => {

  const isLoadingBalances = () => {  
      let counter = 0;
      let stop = 1;
      if (counter < stop) {
        counter++;
        return true;
      }
      return false; 
    } 

    const service: WalletService = new LedgerService('Coin');
    const fake = sinon.replace(service, "isLoadingBalances", sinon.fake(isLoadingBalances));
    const result = service.stopAskingForBalance();

    expect(result).to.be.true;
    // add some verification of the amount of calls to isLoadingBalances

  });
  it('balance stoped after first intent', async () => {

  const isLoadingBalances = () => {  
    let counter = 0;
    let stop = 2;
    if (counter < stop) {
      counter++;
      return true;
    }
    return false; 
  } 

  const service: WalletService = new LedgerService('Coin');
  const fake = sinon.replace(service, "isLoadingBalances", sinon.fake(isLoadingBalances));
  const result = service.stopAskingForBalance();

  expect(result).to.be.true;
  // add some verification of the amount of calls to isLoadingBalances

  });
  it('balance stoped after 10 intents', async () => {

  const isLoadingBalances = () => {  
    let counter = 0;
    let stop = 10;
    if (counter < stop) {
      counter++;
      return true;
    }
    return false; 
  } 

  const service: WalletService = new LedgerService('Coin');
  const fake = sinon.replace(service, "isLoadingBalances", sinon.fake(isLoadingBalances));
  const result = service.stopAskingForBalance();

  expect(result).to.be.true;
  // add some verification of the amount of calls to isLoadingBalances

  });
  it('balance stoped timetout', async () => {

  const isLoadingBalances = () => {  
    let counter = 0;
    let stop = 30;
    if (counter < stop) {
      counter++;
      return true;
    }
    return false; 
  } 

  const service: WalletService = new LedgerService('Coin');
  const fake = sinon.replace(service, "isLoadingBalances", sinon.fake(isLoadingBalances));
  const result = service.stopAskingForBalance();

  expect(result).to.be.true;
  // add some verification of the amount of calls to isLoadingBalances
  });  

});
