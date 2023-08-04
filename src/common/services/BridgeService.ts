import { bridge } from '@rsksmart/rsk-precompiled-abis';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';

export class BridgeService {
  private bridgeContract: Contract;

  private web3: Web3;

  private totalRbtcStock = constants.TOTAL_RBTC_STOCK;

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

  public getLockingCapAmount(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.bridgeContract.methods
        .getLockingCap()
        .call()
        .then((lockingCap: string) => resolve(Number(lockingCap)))
        .catch(reject);
    });
  }

  public getRbtcInCirculation(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.web3.eth
        .getBalance(bridge.address)
        .then((balance: string) => {
          const amount = Number(
            this.web3.utils.toWei(
              this.web3.utils.toBN(this.totalRbtcStock),
              'wei',
            ),
          ) - Number(balance);
          resolve(amount);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  public getPeginAvailability(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      Promise.all([this.getLockingCapAmount(), this.getRbtcInCirculation()])
        .then(([lockingCap, rbtcInCirculation]) => {
          const rbtcInCirculationToSatoshis = Math.round(rbtcInCirculation / 1e10);
          let availability = lockingCap - rbtcInCirculationToSatoshis;
          availability = availability > 0 ? availability : 0;
          const maxAllowed = EnvironmentAccessorService.getEnvironmentVariables()
            .maxAmountAllowedInSatoshis ? Number(EnvironmentAccessorService
              .getEnvironmentVariables().maxAmountAllowedInSatoshis)
            : Infinity;
          resolve(Math.min(availability, maxAllowed));
        })
        .catch((reason) => {
          reject(reason);
        });
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
}
