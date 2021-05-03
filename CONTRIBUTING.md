# Contributing [![GitHub contributors](https://img.shields.io/github/contributors/juice-shop/juice-shop-ctf.svg)](https://github.com/juice-shop/juice-shop-ctf/graphs/contributors) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[![CI Pipeline](https://github.com/juice-shop/juice-shop-ctf/actions/workflows/ci.yml/badge.svg)](https://github.com/juice-shop/juice-shop-ctf/actions/workflows/ci.yml)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/bkimminich/juice-shop-ctf.svg)](https://cloud.docker.com/repository/docker/bkimminich/juice-shop-ctf/builds)
[![Coverage Status](https://coveralls.io/repos/github/juice-shop/juice-shop-ctf/badge.svg?branch=master)](https://coveralls.io/github/juice-shop/juice-shop-ctf?branch=master)
[![Code Climate](https://codeclimate.com/github/juice-shop/juice-shop-ctf/badges/gpa.svg)](https://codeclimate.com/github/juice-shop/juice-shop-ctf)
![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/bkimminich/juice-shop-ctf.svg)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/juice-shop-ctf-cli.svg)
![Merge Chance](https://img.shields.io/endpoint?url=https%3A%2F%2Fmerge-chance.info%2Fbadge%3Frepo%3Djuice-shop/juice-shop-ctf)

Found a bug? Got an idea for enhancement? Feel like adding support for
another CTF framework?

Feel free to
[create an issue](https://github.com/juice-shop/juice-shop-ctf/issues)
or
[post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)!
Pull requests are also highly welcome - please follow the guidelines
below to make sure your PR can be merged and doesn't break anything.

## Git-Flow

This repository is maintained in a simplified
[Git-Flow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/)
fashion: All active development happens on the `develop` branch while
`master` is used to create tagged releases from.

### Pull Requests

Using Git-Flow means that PRs have the highest chance of getting
accepted and merged when you open them on the `develop` branch of your
fork. That allows for some post-merge changes by the team without
directly compromising the `master` branch, which is supposed to hold
always be in a release-ready state.

## JavaScript Standard Style Guide

The `npm lint` script verifies code compliance with the `standard`
style. If PRs deviate from this coding style, they will immediately fail
their build and will not be merged until compliant.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> In case your PR is failing from style guide issues try running
> `standard --fix` over your code - this will fix all syntax or code
> style issues automatically without breaking your code. You might need
> to `npm i -g standard` first.

## Testing

Pull Requests are verified to pass all of the following test stages
during the
[continuous integration build](https://travis-ci.org/juice-shop/juice-shop-ctf).
It is recommended that you run these tests on your local computer to
verify they pass before submitting a PR. New features should be
accompanied by an appropriate number of corresponding tests to verify
they behave as intended.

### Unit Tests

There is a full suite containing independent unit tests for each module.

```
npm test
```

### End-to-end Tests

The e2e tests simulate real input to the CLI as well as file-based
configuration and verify the output on the console and in the exported
archive file.

```
npm run e2e
```
