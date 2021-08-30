FROM node:14-alpine

WORKDIR /my-react

COPY package.json ./
COPY packages/app/package.json ./packages/app/
COPY packages/my-react/package.json ./packages/my-react/
COPY yarn.lock ./

RUN yarn install

COPY . .

# wsl2 https://stackoverflow.com/questions/63043175/accessing-localhost-on-lan-with-webpack-dev-server-running-in-wsl-2
ENV port=3000\
    host=0.0.0.0

EXPOSE 3000

CMD ["yarn", "start"]