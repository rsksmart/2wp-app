# 2wp-app
This is the front end application for 2-Way-Peg solution.
## Project setup
```
npm install
```
### Environment variables
Create a `.env.local` file in order to store locally the required variables for the app with the following fields:
```dotenv
VUE_APP_COIN='test' ## or main
VUE_APP_MANIFEST_EMAIL= <EMAIL_FOR_TREZOR_MANIFEST>
VUE_APP_MANIFEST_APP_URL= <URL_FOR_TREZOR_MANIFEST> ## 'https://2waypeg.rsk.co/'
VUE_APP_API_BASE_URL= <API_URL>
VUE_APP_RSK_NODE_HOST=<RSK_NODE_HOST>

VUE_APP_HOTJAR_ID=<HOT_JAR_ID_FOR_THE_ENVIRONMENT>
```
## Development mode
```
npm run serve
```

## Deployment
```shell
docker-compose up
```

## Report Security Vulnerabilities

To report a vulnerability, please use the [vulnerability reporting guideline](./SECURITY.md) for details on how to do it.
