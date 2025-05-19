import { bridge } from '@rsksmart/rsk-precompiled-abis';
import { BigNumber, ethers } from 'ethers';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export class BridgeService {
  private bridgeContract: ethers.Contract;

  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    const rpcUrl = EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.bridgeContract = new ethers.Contract(
      bridge.address,
      bridge.abi,
      this.provider,
    );
  }

  public getFederationAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.bridgeContract.getFederationAddress()
        .then(resolve)
        .catch(reject);
    });
  }

  public getMinPeginValue(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract
        .getMinimumLockTxValue()
        .then((minValue: string) => resolve(Number(minValue)))
        .catch(reject);
    });
  }

  public getEstimatedFeesForNextPegOutEvent(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract
        .getEstimatedFeesForNextPegOutEvent()
        .then((value: BigNumber) => resolve(value.toBigInt()))
        .catch(reject);
    });
  }

  public getQueuedPegoutsCount(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract
        .getQueuedPegoutsCount()
        .then((value: BigNumber) => resolve(value.toBigInt()))
        .catch(reject);
    });
  }

  public getNextPegoutCreationBlockAt(blockNumber: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract
        .getNextPegoutCreationBlockNumber({ blockTag: blockNumber })
        .then((creationBlock: string) => {
          resolve(Number(creationBlock));
        })
        .catch(reject);
    });
  }

  public getLockingCap(): Promise<bigint> {
    return new Promise<bigint>((resolve, reject) => {
      this.bridgeContract
        .getLockingCap()
        .then((value: BigNumber) => resolve(value.toBigInt()))
        .catch(reject);
    });
  }
}
