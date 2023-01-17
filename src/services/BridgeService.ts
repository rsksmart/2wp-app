import { bridge } from '@rsksmart/rsk-precompiled-abis';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export class BridgeService {
  private bridgeContract: Contract;

  private web3: Web3;

  constructor() {
    this.web3 = new Web3(EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost);
    this.bridgeContract = bridge.build(this.web3);
  }

  public getFederationAddress(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.bridgeContract.methods
        .getFederationAddress()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }

  public getEstimatedFeesForNextPegOutEvent(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract.methods
        .getEstimatedFeesForNextPegOutEvent()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }

  public getQueuedPegoutsCount(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract.methods
        .getQueuedPegoutsCount()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }
}
