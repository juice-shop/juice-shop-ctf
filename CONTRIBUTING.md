# Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop-ctf.svg)](https://github.com/bkimminich/juice-shop-ctf/graphs/contributors) [![HuBoard](http://img.shields.io/badge/Hu-Board-blue.svg)](https://huboard.com/bkimminich/juice-shop-ctf)

Found a bug? Got an idea for enhancement? Improvement for cheating
prevention?

Feel free to
[create an issue](https://github.com/bkimminich/juice-shop-ctf/issues)
or
[post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)!
Pull requests are also highly welcome - please follow the guidelines
below to make sure your PR can be merged and doesn't break anything.

## Git-Flow

This repository is maintained in a simplified
[Git-Flow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/)
fashion: All active development happens on the ```develop``` branch
while ```master``` is used to create tagged releases from.

### Pull Requests

Using Git-Flow means that PRs have the highest chance of getting
accepted and merged when you open them on the ```develop``` branch of
your fork. That allows for some post-merge changes by the team without
directly compromising the ```master``` branch, which is supposed to hold
always be in a release-ready state.

### JavaScript Standard Style Guide

Since v2.7.0 the `npm test` script verifies code complicance with the
`standard` style before running the tests. If PRs deviate from this
coding style, they will now immediately fail their build and will not be
merged until compliant.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> In case your PR is failing from style guide issues try running
> `standard --fix` over your code - this will fix all syntax or code
> style issues automatically without breaking your code. You might need
> to `npm install -g standard` first.
