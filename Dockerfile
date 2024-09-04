FROM node:20.16.0 AS build

WORKDIR /build

COPY package*.json /build/

RUN npm i

FROM node:20.16.0-slim

WORKDIR /app

COPY --from=build /build/ /app/
COPY . /app/

ENTRYPOINT [ "npm" ]
