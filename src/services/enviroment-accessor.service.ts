import { EnvironmentVariables } from '@/types/environment-variables';

let initializedEnvironment: EnvironmentVariables;

export class EnvironmentAccessorService {
  static getEnvironmentVariables(): EnvironmentVariables {
    if (initializedEnvironment === undefined) {
      initializedEnvironment = new EnvironmentVariables();
    }
    return initializedEnvironment;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static initializeEnvironmentVariables(defaultValues: any = {}): void {
    initializedEnvironment = new EnvironmentVariables(defaultValues);
  }
}
