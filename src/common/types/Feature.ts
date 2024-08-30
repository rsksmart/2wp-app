export enum FeatureNames {
  TERMS_AND_CONDITIONS = 'terms_and_conditions',
  FLYOVER_PEG_IN = 'flyover_pegin',
  FLYOVER_PEG_OUT = 'flyover_pegout'
}
export interface Feature {
  name: FeatureNames;
  value?: string;
  version: number;
  enabled: boolean;
}
