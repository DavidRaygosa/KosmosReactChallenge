FROM node:16 as build

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

### Stage 2
FROM nginx:alpine
ADD ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /var/www/app
EXPOSE 80
CMD ["nginx","-g","daemon off;"]