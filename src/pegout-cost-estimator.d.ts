declare module 'pegout-cost-estimator'{
  import Web3 from 'web3';

  interface NetworkSettings {
    networkUpgradesActivationHeights: unknown,
    erpDetails: unknown,
    network: string,
  }

  function estimatePegoutCostInWeis(
    amountToPegoutInSatoshis: number,
    web3: Web3,
    networkSettings: NetworkSettings,
    ): Promise<string>;
  function estimatePegoutValueInSatoshis(
    amountToPegoutInWeis: number,
    web3: Web3,
    networkSettings: NetworkSettings,
    ): Promise<string>;
  function setUtxoSortingMethod(compareFunction: (a, b) => number): void;
  export {
    estimatePegoutCostInWeis,
    estimatePegoutValueInSatoshis,
    setUtxoSortingMethod,
  };
}
