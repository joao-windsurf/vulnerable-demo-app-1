FROM node:18 AS builder

WORKDIR /build

RUN curl -o important.html https://www.google.com/

# --------------------------------------------------

FROM node:18-slim

WORKDIR /usr/src/app

COPY --from=builder /build/important.html ./important.html

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

USER node

CMD ["node", "src/index.js"]
