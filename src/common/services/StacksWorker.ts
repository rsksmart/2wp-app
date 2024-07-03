/* eslint-disable no-restricted-globals */
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

self.onmessage = (event) => {
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
