FROM node:10 as installer
COPY . /juice-shop-ctf
WORKDIR /juice-shop-ctf
RUN chown -R node .
USER node
ARG DEV_BUILD=false
RUN if [ ${DEV_BUILD} = true ]; then npm i && npm lint && npm test && npm run e2e; else npm install --production --unsafe-perm; fi

FROM node:9-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop CTF-Extension" \
    org.opencontainers.image.description="Capture-the-Flag (CTF) environment setup tools for OWASP Juice Shop" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Web Application Security Project" \
    org.opencontainers.image.documentation="http://help.owasp-juice.shop/part1/ctf.html" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="6.1.1" \
    org.opencontainers.image.url="http://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/bkimminich/juice-shop-ctf.git" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE
COPY --from=installer /juice-shop-ctf /juice-shop-ctf
VOLUME /data
WORKDIR /data
ENTRYPOINT ["npx", "/juice-shop-ctf/bin/juice-shop-ctf.js"]
