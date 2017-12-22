FROM node:8 as installer
COPY . /juice-shop-ctf
WORKDIR /juice-shop-ctf
RUN npm install --production --unsafe-perm

FROM node:8-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
      org.label-schema.name="OWASP Juice Shop CTF" \
      org.label-schema.description="Capture-the-Flag (CTF) environment setup tools for OWASP Juice Shop" \
      org.label-schema.vendor="Open Web Application Security Project" \
      org.label-schema.url="http://owasp-juice.shop" \
      org.label-schema.usage="http://help.owasp-juice.shop/part1/ctf.html" \
      org.label-schema.license="MIT" \
      org.label-schema.version="3.1.0-SNAPSHOT" \
      org.label-schema.docker.cmd="docker run --rm -it bkimminich/juice-shop-ctf" \
      org.label-schema.vcs-url="https://github.com/bkimminich/juice-shop-ctf.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.schema-version="1.0.0-rc1"
WORKDIR /juice-shop-ctf
COPY --from=installer /juice-shop-ctf .
CMD ["bash", "./bin/juice-shop-ctf.js"]