# Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop-ctf-server.svg)](https://github.com/bkimminich/juice-shop-ctf-server/graphs/contributors) [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop-ctf-server) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Found a bug? Got an idea for enhancement? Improvement for cheating prevention?

Feel free to [create an issue](https://github.com/bkimminich/juice-shop-ctf-server/issues) or [post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)! Pull requests are also highly welcome - please follow the guidelines below to make sure your PR can be merged and doesn't break anything.

## Git-Flow

This repository is maintained in a simplified [Git-Flow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/) fashion: All active development happens on the ```develop``` branch while ```master``` is used to create tagged releases from.

### Pull Requests

Using Git-Flow means that PRs have the highest chance of getting accepted and merged when you open them on the ```develop``` branch of your fork. That allows for some post-merge changes by the team without directly compromising the ```master``` branch, which is supposed to hold always be in a release-ready state.

## Unit & Integration Tests

There is a full suite containing
* independent unit tests for the client- and server-side code
* integration tests for the server-side API

These tests verify if the normal use cases of the application work. All server-side vulnerabilities are also tested.

```
npm test
```

### JavaScript Standard Style Guide

The `npm test` script verifies code complicance with the `standard` style before running the tests. If PRs deviate from this coding style, they will now immediately fail their build and will not be merged until compliant.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> In case your PR is failing from style guide issues try running `standard --fix` over your code - this will fix all syntax or code style issues automatically without breaking your code. You might need to `npm install -g standard` first.

## End-to-end Tests

The e2e test suite verifies if the interaction with connected instances of the Juice Shop application works correctly.

```
npm run protractor
```

## Mutation Tests

The [mutation tests](https://en.wikipedia.org/wiki/Mutation_testing) ensure the quality of the unit test suite by making small changes to the code that should cause one or more tests to fail. If none does this "mutated line" is not properly covered by meaningful assertions.

```
npm run stryker
```

## Bountysource

From time to time issues might get a bounty assigned which is paid out to the implementor via the Bountysource platform.

> How Bounties work:
>
> 1.   Users fund bounties on open issues or feature requests they want to see addressed.
> 2.   Developers create solutions which closes the issue and claim the bounty on Bountysource.
> 3.   Backers can accept or reject the claim.
> 4.   If accepted, Bountysource pays the bounty to the developer.

## Localization [![Crowdin](https://d322cqt584bo4o.cloudfront.net/owasp-juice-shop/localized.svg)](https://crowdin.com/project/owasp-juice-shop)

OWASP Juice Shop uses [Crowdin](https://crowdin.com/project/owasp-juice-shop/) as a translation platform, which is basically offering a simple translator/proofreader workflow very user friendly especially for non-developers.


> Hidden beneath, Crowdin will use the dedicated `l10n_develop` Git branch to synchronize translations into the `app/i18n/??.json` language files where `??` is a language code (e.g. `en` or `de`).

If you would like to participate in the translation process, visit https://crowdin.com/project/owasp-juice-shop/invite.
If you miss a language, please [contact us](https://crowdin.com/mail/compose/bkimminich) and we will add it right away!
