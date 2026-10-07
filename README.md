[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rsksmart_2wp-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rsksmart_2wp-app)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9697/badge)](https://www.bestpractices.dev/projects/9697)

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/2wp-app/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/2wp-app)

[Releases](https://github.com/rsksmart/2wp-app/releases/latest)


# PowPeg app
This is the front end application for 2-Way-Peg solution.
The solution will be a **web interface (this app)**, which integrates with a Rest API, which in turn communicates with internal services such as the blockchain node and databases. In addition, a daemon/worker will be created that will be responsible for obtaining data from the blockchain and changing the status of the transaction.

## Project setup

### Check npm and node versions
Ensure you are using the following versions of npm and node:
```
npm -v
11.x
```
```
node -v
v24.18.0
```
#### nvm
(Optionally) Use version from `.nvmrc`:
```
nvm use
```
### Installation
Install resolved dependencies in `package-lock.json`:
```
npm ci
```
### Environment variables
Create a `.env.local` file in order to store locally the required variables for the app.

All environment variables are listed in this [here](./ENV_VARIABLES.md).

## Development mode
The **PowPeg app** application will run on **8080 port**.

```
npm run serve
```

### Testing
To execute unit tests, run:
```
npm run test
```

### Running Lint
```
npm run lint 
```

## Production mode
To create a production build, run:
```
npm run build
```

## Sunset warning banner

A warning banner can be shown at the top of every page (above the header) to announce the
PowPeg app sunset. Its text is read from the feature flag `sunset_banner_message`, served by
the 2wp-api `/features` endpoint (backoffice flag `SUNSET_BANNER_MESSAGE`, of type string, or the
`features` collection).

- **Expected value:** a plain-text string, e.g.
  `The PowPeg app will be discontinued on October 31, 2026.` It is rendered as plain text (no
  HTML); line breaks are kept and long messages wrap.
- **Update it:** change the flag value in the backoffice (or the `features` collection). No code
  change or redeploy is needed: the new text shows on the next page load, once the 2wp-api flag
  cache refreshes.
- **Hide it:** disable the flag (`false` / `disabled`), set it to an empty string, or remove it.
  The banner is also hidden when the features cannot be fetched.
- Keep the key free of a boolean flag prefix (e.g. not `POWPEG_...`, since `POWPEG` is a boolean
  flag): the 2wp-api would treat it as a property of that flag and the banner would not show.
  Likewise, do not create boolean flags named `SUNSET` or `SUNSET_BANNER`.

## Report Security Vulnerabilities

To report a vulnerability, please use the [vulnerability reporting guideline](./SECURITY.md) for details on how to do it.

## Adding your own wallet for pegin

To know how to add your own wallet in the pegin page, visit [how to add new wallet, step by step](./Wallet.md) for details on how to do it.

## Documentation

See [`docs/`](./docs/) for the peg-in and peg-out flows, and how wallet connection & signing,
transaction status tracking, Flyover quotes & refunds, QR code payment, and UTXO selection work.
