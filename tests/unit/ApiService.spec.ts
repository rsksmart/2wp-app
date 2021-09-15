/* eslint-disable */
import { NormalizedInput, NormalizedOutput } from '@/types';
import ApiService  from '@/services/ApiService';
import axios, { AxiosResponse } from 'axios';
import sinon from 'sinon';
import { expect } from 'chai';
import { BridgeService } from '@/services/BridgeService';
import * as PowPegAddressUtils from '@/services/PowPegAddressUtils';
import * as OpReturnUtils from '@/services/OpReturnUtils';

function getNormalizedTx(): Promise<AxiosResponse> {
    return new Promise<AxiosResponse>((resolve) => {
       const outputs: NormalizedOutput[] = [];
       const inputs: NormalizedInput[] = [];
       resolve( 
         {data:
              {
                coin: '0',
                inputs: inputs, 
                outputs: outputs,
                opReturnData: 'test1'
              },
         status: 200,
         statusText: 'OK',
         headers: {},
         config: {}
        });
      })
};
  
function setEnvironment(isValidOpReturn: boolean, isValidPowPegAddress?: boolean) {
  sinon.stub(BridgeService.prototype, 'getFederationAddress').resolves('powPegAddress');
  sinon.stub(axios, 'post').resolves(getNormalizedTx());
  sinon.stub(OpReturnUtils, 'isValidOpReturn').returns(isValidOpReturn);
  if (isValidPowPegAddress) {
    sinon.stub(PowPegAddressUtils, 'isValidPowPegAddress').returns(isValidPowPegAddress);
  }
};

describe('function: createPeginTx', () => {

  afterEach(function () {
    sinon.restore();
  });

  it('opReturn validation returns false, function reject', async () => {
    setEnvironment(false);

    try {
      await ApiService.createPeginTx(1,'refundBtcAddress', 'recipientRsKAddress', 'sessionId', 'feeLevel', 'changeBtcAddress');
    } catch (e)
    {
      expect(e).to.be.a('error', 'Invalid data when parsing OpReturn');
    }
  });

  it('opReturn validation returns true, powpeg validation returns false, function reject', async () => {
    setEnvironment(true, false);

    try {
      await ApiService.createPeginTx(1,'refundBtcAddress', 'recipientRsKAddress', 'sessionId', 'feeLevel', 'changeBtcAddress');
    } catch (e)
    {
      expect(e).to.be.a('error', 'Invalid data when comparing Powpeg Address');
    }
  });

  it('opReturn validation returns true, powpeg validation returns true, return promise', async () => {
    setEnvironment(true, true);

    const result = await ApiService.createPeginTx(1,'refundBtcAddress', 'recipientRsKAddress', 'sessionId', 'feeLevel', 'changeBtcAddress');
    expect(result.coin).to.be.equal('0');
    expect(result.opReturnData).to.be.equal('test1');
  });

});
