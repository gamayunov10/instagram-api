# Check out https://hub.docker.com/_/node to select a new base image
FROM node:20.11-alpine

RUN npm install -g pnpm

ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port

USER node

RUN mkdir -p /home/node/dist/${SERVICE}
WORKDIR /home/node/dist/${SERVICE}

COPY --chown=node package*.json ./
RUN pnpm install --no-prefer-frozen-lockfile --no-cache

# Bundle app source code
COPY --chown=node . .

RUN pnpm run build:${SERVICE} --no-cache

EXPOSE ${PORT}

CMD pnpm run 'start:instagram-gateway'
