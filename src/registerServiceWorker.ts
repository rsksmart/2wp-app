/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready(registration) {
      if ('periodicSync' in registration) {
        navigator.permissions.query({ name: 'periodic-background-sync' as PermissionName })
          .then((permission) => {
            if (permission.state === 'granted') {
              // @ts-expect-error not periodicsync ts support
              registration.periodicSync.register('update-txs', { minInterval: 1000 * 60 * 60 }); // 1 hour
            }
          })
          .catch((error) => {
            console.error('Periodic Sync registration failed', error);
          });
      }
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated() {
      console.log('New content is available; please refresh.');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
