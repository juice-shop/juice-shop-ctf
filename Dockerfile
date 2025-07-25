FROM node:20 as installer
COPY package*.json /juice-shop-ctf/
WORKDIR /juice-shop-ctf
RUN npm install
FROM installer as builder
COPY . /juice-shop-ctf/
WORKDIR /juice-shop-ctf
RUN npm run build

FROM node:20-alpine as production
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
WORKDIR /juice-shop-ctf
RUN npm install --omit=dev --no-fund

COPY --from=builder /juice-shop-ctf/dist /juice-shop-ctf/dist
COPY --from=builder /juice-shop-ctf/data /juice-shop-ctf/data
COPY --from=builder /juice-shop-ctf/lib /juice-shop-ctf/lib
COPY --from=builder /juice-shop-ctf/dist/bin /juice-shop-ctf/bin

VOLUME /data
WORKDIR /data
RUN chmod +x /juice-shop-ctf/bin/juice-shop-ctf.js
USER node
ENTRYPOINT ["npx", "/juice-shop-ctf/bin/juice-shop-ctf.js"]
