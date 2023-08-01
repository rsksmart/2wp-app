[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rsksmart_2wp-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rsksmart_2wp-app)

# 2wp-app
This is the front end application for 2-Way-Peg solution.
The solution will be a **web interface (this app)**, which integrates with a Rest API, which in turn communicates with internal services such as the blockchain node and databases. In addition, a daemon/worker will be created that will be responsible for obtaining data from the blockchain and changing the status of the transaction.

## Project setup
```
npm install
```
### Environment variables
Create a `.env.local` file in order to store locally the required variables for the app with the following fields:

All environment variables are listed in this [here](./ENV_VARIABLES.md).

## Development mode
The **2wp-app** application will run on **8080 port**.


### Using npm
```
npm run serve
```

### Check npm and node versions
```sh
npm -version
6.14.16
```

```sh
node -v
v14.19.1
```

### Deployment
```shell
docker-compose up
```

### Testing
To execute unit tests, run:
```shel
npm run test
```

### Running Lint
```shel
npm run lint 
```
## Production mode
To create a production build, run:
```shel
npm run build
```

## Report Security Vulnerabilities

To report a vulnerability, please use the [vulnerability reporting guideline](./SECURITY.md) for details on how to do it.
