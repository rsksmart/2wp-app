FROM node@sha256:11ea38054c38143aa6682c39205abeaed1c7f0d3a66d25d8b01e129a0c1480ce as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build

FROM nginx@sha256:28402db69fec7c17e179ea87882667f1e054391138f77ffaf0c3eb388efc3ffb as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.crt /etc/ssl/
COPY nginx.key /etc/ssl/
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /

CMD ["sh", "/entrypoint.sh"]
