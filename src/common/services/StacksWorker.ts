/* eslint-disable */
// @ts-nocheck
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const localStorage = {
  getItem(key: string): string {
    return this[key];
  },
  setItem(key: string, value: string): void {
    this[key] = value;
  },
  'blockstack-session': '',
};

Object.assign(self, {
  window: { localStorage },
  document: {},
  localStorage,
});

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

self.onmessage = (event) => {
  if (event.data.document) {
    console.log(document);
    Object.assign(self.document, event.data.document);
  }

  if (event.data.stacksSession) {
    self.localStorage.setItem('blockstack-session', event.data.stacksSession);
  }

  if (event.data === 'isUserSignedIn') {
    self.postMessage({ isUserSignedIn: userSession.isUserSignedIn() });
  }
  if (event.data === 'showConnect') {
    showConnect(
      {
        userSession,
        appDetails: {
          name: 'App Name',
          icon: '',
        },
        onFinish: () => {
          self.postMessage({ userSession });
        },
        onCancel: () => {
          self.postMessage({ error: 'User closed the modal' });
        },
      },
    );
  }
};
