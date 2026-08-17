# syntax=docker/dockerfile:1.4

ARG NODE_VERSION=26

####################################################################################################
## Build Packages

FROM node:${NODE_VERSION}-alpine AS builder

RUN apk --no-cache add python3 py3-setuptools build-base

WORKDIR /directus

COPY package.json .
RUN npm install -g corepack && corepack enable && corepack prepare

# Build as 'node' user to match production image user
# (see https://github.com/directus/directus/issues/23822)
RUN chown node:node .
USER node

ENV NODE_OPTIONS=--max-old-space-size=8192

COPY --chown=node:node . .
RUN <<EOF
	set -ex
	yarn install --immutable
	yarn workspaces foreach -A -t -j 2 run build
	node scripts/deploy-production.mjs
EOF

####################################################################################################
## Create Production Image

FROM node:${NODE_VERSION}-alpine AS runtime

# Apply outstanding OS-level security patches (openssl, zlib, busybox, ...).
# Install pm2, then purge npm, npx, corepack, and the npm cache from the
# final image.
RUN apk --no-cache upgrade \
	&& npm install --global pm2@6 \
	&& rm -rf \
		/usr/local/lib/node_modules/npm \
		/usr/local/lib/node_modules/corepack \
		/usr/local/bin/npm \
		/usr/local/bin/npx \
		/usr/local/bin/corepack \
		/root/.npm

USER node

WORKDIR /directus

ENV \
	DB_CLIENT="sqlite3" \
	DB_FILENAME="/directus/database/database.sqlite" \
	NODE_ENV="production" \
	NPM_CONFIG_UPDATE_NOTIFIER="false"

COPY --from=builder --chown=node:node /directus/ecosystem.config.cjs .
COPY --from=builder --chown=node:node /directus/dist .

EXPOSE 8055

CMD : \
	&& node cli.js bootstrap \
	&& pm2-runtime start ecosystem.config.cjs \
	;
