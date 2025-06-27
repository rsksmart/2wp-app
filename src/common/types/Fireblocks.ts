export interface VaultAccount {
  id: number;
  name: string;
  assets: Array<{
    id: string;
    total: number;
  }>;
}
