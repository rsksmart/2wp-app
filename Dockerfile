FROM node@sha256:4e87fa2c1aa4a31edfa4092cc50428e86bf129e5bb528e2b3bbc8661e2038339 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build

FROM nginx@sha256:bc5eac5eafc581aeda3008b4b1f07ebba230de2f27d47767129a6a905c84f470 as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.crt /etc/ssl/
COPY nginx.key /etc/ssl/
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /

CMD ["sh", "/entrypoint.sh"]
