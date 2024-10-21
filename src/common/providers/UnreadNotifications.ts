import { InjectionKey, Ref } from 'vue';

export interface UnreadNotification {
  counter: Ref<number>
  updateCounter: (value: number) => void
  }

export const unreadNotificationsKey = Symbol('UnreadNotificationsKey') as InjectionKey<UnreadNotification>;
