FROM node@sha256:c65ab339c494443a7d2ed36140674bc8815f7100b0d4cebfe0144ce35267a693 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build

FROM nginx@sha256:42e917aaa1b5bb40dd0f6f7f4f857490ac7747d7ef73b391c774a41a8b994f15 as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.crt /etc/ssl/
COPY nginx.key /etc/ssl/
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /

CMD ["sh", "/entrypoint.sh"]
