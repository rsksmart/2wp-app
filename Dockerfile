FROM node@sha256:840dad0077213cadd2d734d542ae11cd0f648200be29504eb1b6e2c995d2b75a as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build

FROM nginx@sha256:fb197595ebe76b9c0c14ab68159fd3c08bd067ec62300583543f0ebda353b5be as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.crt /etc/ssl/
COPY nginx.key /etc/ssl/
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /

CMD ["sh", "/entrypoint.sh"]
