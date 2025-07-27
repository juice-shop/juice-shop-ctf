FROM node:20-alpine AS installer
WORKDIR /juice-shop-ctf
COPY package*.json .
RUN npm ci --omit=dev --no-fund

FROM node:20-alpine AS builder
WORKDIR /juice-shop-ctf
COPY package*.json .
RUN npm ci --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /juice-shop-ctf
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop CTF-Extension" \
    org.opencontainers.image.description="Capture-the-Flag (CTF) environment setup tools for OWASP Juice Shop" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Web Application Security Project" \
    org.opencontainers.image.documentation="https://help.owasp-juice.shop/part1/ctf.html" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="11.1.0" \
    org.opencontainers.image.url="https://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/juice-shop/juice-shop-ctf.git" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE

COPY package*.json /juice-shop-ctf/
COPY --from=installer /juice-shop-ctf/node_modules /juice-shop-ctf/node_modules
COPY --from=builder /juice-shop-ctf/dist /juice-shop-ctf/data /juice-shop-ctf/lib /juice-shop-ctf/

RUN chmod +x /juice-shop-ctf/bin/juice-shop-ctf.js
USER node
VOLUME /data
WORKDIR /data
ENTRYPOINT ["npx", "/juice-shop-ctf/bin/juice-shop-ctf.js"]