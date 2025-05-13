import { bridge } from '@rsksmart/rsk-precompiled-abis';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

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

  public getMinPeginValue(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract.methods
        .getMinimumLockTxValue()
        .call()
        .then((minValue: string) => resolve(Number(minValue)))
        .catch(reject);
    });
  }

  public getEstimatedFeesForNextPegOutEvent(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract.methods
        .getEstimatedFeesForNextPegOutEvent()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }

  public getQueuedPegoutsCount(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract.methods
        .getQueuedPegoutsCount()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }

  public getNextPegoutCreationBlockAt(blockNumber: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract.defaultBlock = blockNumber;
      this.bridgeContract.methods
        .getNextPegoutCreationBlockNumber()
        .call()
        .then((creationBlock: string) => {
          this.bridgeContract.defaultBlock = 'latest';
          resolve(Number(creationBlock));
        })
        .catch(reject);
    });
  }

  public getLockingCap(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract.methods
        .getLockingCap()
        .call()
        .then(resolve)
        .catch(reject);
    });
  }
}
