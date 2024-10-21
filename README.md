[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rsksmart_2wp-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rsksmart_2wp-app)

# PowPeg app
This is the front end application for 2-Way-Peg solution.
The solution will be a **web interface (this app)**, which integrates with a Rest API, which in turn communicates with internal services such as the blockchain node and databases. In addition, a daemon/worker will be created that will be responsible for obtaining data from the blockchain and changing the status of the transaction.

## Project setup

### Check npm and node versions
Ensure you are using the following versions of npm and node:
```
npm -v
9.5.1
```
```
node -v
v18.16.1
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

## Report Security Vulnerabilities

To report a vulnerability, please use the [vulnerability reporting guideline](./SECURITY.md) for details on how to do it.

## Adding your own wallet for pegin

To know how to add your own wallet in the pegin page, visit [how to add new wallet, step by step](./WALLET.md) for details on how to do it.

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/2wp-app/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/2wp-app)