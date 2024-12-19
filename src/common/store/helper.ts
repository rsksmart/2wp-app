import { computed, ComputedRef } from 'vue';
import { useStore } from 'vuex';

export function useStateAttribute<T>(module: string, attribute: string) {
  const store = useStore();
  return computed<T>(() => store.state[module][attribute]);
}

export function useState<T>(module: string) {
  const store = useStore();
  return computed<T>(() => store.state[module]);
}

export function useGetters(module: string, getters: string[]) {
  const store = useStore();
  const keyPair = getters.map((g) => [g, computed(() => store.getters[`${module}/${g}`])]);
  return Object.fromEntries(keyPair);
}

export function useAction<T>(module: string, action: string) {
  const store = useStore();
  // eslint-disable-next-line
  return async (param?: any): Promise<T> => store.dispatch(`${module}/${action}`, param);
}

export function useGetter<T>(module: string, getter: string): ComputedRef<T> {
  const store = useStore();
  return computed<T>(() => store.getters[`${module}/${getter}`]);
}
