# ![Juice Shop CTF Logo](https://raw.githubusercontent.com/bkimminich/juice-shop-ctf/master/images/JuiceShopCTF_Logo_100px.png) OWASP Juice Shop CTF [![OWASP Flagship](https://img.shields.io/badge/owasp-flagship%20project-48A646.svg)](https://www.owasp.org/index.php/OWASP_Project_Inventory#tab=Flagship_Projects) [![GitHub release](https://img.shields.io/github/release/bkimminich/juice-shop-ctf.svg)](https://github.com/bkimminich/juice-shop-ctf/releases/latest) [![Twitter Follow](https://img.shields.io/twitter/follow/owasp_juiceshop.svg?style=social&label=Follow)](https://twitter.com/owasp_juiceshop) [![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/owasp_juiceshop?style=social)](https://reddit.com/r/owasp_juiceshop)

[![Build Status](https://travis-ci.org/bkimminich/juice-shop-ctf.svg?branch=master)](https://travis-ci.org/bkimminich/juice-shop-ctf)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/bkimminich/juice-shop-ctf.svg)](https://cloud.docker.com/repository/docker/bkimminich/juice-shop-ctf/builds)
[![Coverage Status](https://coveralls.io/repos/github/bkimminich/juice-shop-ctf/badge.svg?branch=master)](https://coveralls.io/github/bkimminich/juice-shop-ctf?branch=master)
[![Code Climate](https://codeclimate.com/github/bkimminich/juice-shop-ctf/badges/gpa.svg)](https://codeclimate.com/github/bkimminich/juice-shop-ctf)
[![Code Climate technical debt](https://img.shields.io/codeclimate/tech-debt/bkimminich/juice-shop-ctf)](https://codeclimate.com/github/bkimminich/juice-shop-ctf/trends/technical_debt)  
![GitHub stars](https://img.shields.io/github/stars/bkimminich/juice-shop-ctf.svg?label=GitHub%20%E2%98%85&style=flat)

The Node package
[`juice-shop-ctf-cli`](https://www.npmjs.com/package/juice-shop-ctf-cli)
helps you to prepare [Capture the Flag](https://en.wikipedia.org/wiki/Capture_the_flag#Computer_security) events with the
[OWASP Juice Shop](https://owasp-juice.shop) challenges for different popular CTF frameworks. This interactive utility allows you to populate a CTF game server in a matter of minutes.

[![asciicast](https://asciinema.org/a/244925.png)](https://asciinema.org/a/244925?size=medium&rows=28&speed=1.25)

## Supported CTF Frameworks

The following open source CTF frameworks are supported by
`juice-shop-ctf-cli`:

* [CTFd 2.x](https://github.com/CTFd/CTFd/releases/latest)
* [CTFd 1.x](https://ctfd.io/)
  ([1.1.x](https://github.com/CTFd/CTFd/releases/tag/1.1.4) or [1.2.x](https://github.com/CTFd/CTFd/releases/tag/1.2.0))
* [FBCTF](https://github.com/facebook/fbctf)
* [RootTheBox](https://github.com/moloch--/RootTheBox)

## Setup ![node](https://img.shields.io/node/v/juice-shop-ctf-cli.svg) [![npm](https://img.shields.io/npm/dm/juice-shop-ctf-cli.svg)](https://www.npmjs.com/package/juice-shop-ctf-cli) [![npm](https://img.shields.io/npm/dt/juice-shop-ctf-cli.svg)](https://www.npmjs.com/package/juice-shop-ctf-cli) ![npm bundle size](https://img.shields.io/bundlephobia/min/juice-shop-ctf-cli.svg)

```
npm install -g juice-shop-ctf-cli
```

## Usage

### Interactive Mode

Open a command line and run:

```
juice-shop-ctf
```

Then follow the instructions of the interactive command line tool.

### Configuration File

Instead of answering questions in the CLI you can also provide your
desired configuration in a file with the following format:

```yaml
ctfFramework: CTFd 2.x | CTFd 1.x | FBCTF | RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key # can also be actual key instead URL
countryMapping: https://raw.githubusercontent.com/bkimminich/juice-shop/master/config/fbctf.yml # ignored for CTFd and RootTheBox
insertHints: none | free | paid
insertHintUrls: none | free | paid # optional for FBCTF
```

You can then run the generator with:

```
juice-shop-ctf --config myconfig.yml
```

Optionally you can also choose the name of the output file:

```
juice-shop-ctf --config myconfig.yml --output challenges.out
```

### Docker Container [![Docker Automated build](https://img.shields.io/docker/automated/bkimminich/juice-shop-ctf.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop-ctf/) [![Docker Pulls](https://img.shields.io/docker/pulls/bkimminich/juice-shop-ctf.svg)](https://registry.hub.docker.com/u/bkimminich/juice-shop-ctf/) ![Docker Stars](https://img.shields.io/docker/stars/bkimminich/juice-shop-ctf.svg) [![](https://images.microbadger.com/badges/image/bkimminich/juice-shop-ctf.svg)](https://microbadger.com/images/bkimminich/juice-shop-ctf "Get your own image badge on microbadger.com") [![](https://images.microbadger.com/badges/version/bkimminich/juice-shop-ctf.svg)](https://microbadger.com/images/bkimminich/juice-shop-ctf "Get your own version badge on microbadger.com")

Share your current directory with the `/data` volume of your
`bkimminich/juice-shop-ctf` Docker container and run the interactive
mode with:

```
docker run -ti --rm -v $(pwd):/data bkimminich/juice-shop-ctf
```

Alternatively you can provide a configuration file via:

```
docker run -ti --rm -v $(pwd):/data bkimminich/juice-shop-ctf --config myconfig.yml
```

Choosing the name of the output file is also possible:

```
docker run -ti --rm -v $(pwd):/data bkimminich/juice-shop-ctf --config myconfig.yml --output challenges.out
```

---

**For detailed step-by-step instructions and examples please refer to
[the _Hosting a CTF event_ chapter](https://pwning.owasp-juice.shop/part1/ctf.html)
in our (free) companion guide ebook.**

## Screenshots

![CTFd challenge overview](https://pwning.owasp-juice.shop/part1/img/ctfd_1.png)

![CTFd challenge details](https://pwning.owasp-juice.shop/part1/img/ctfd_2.png)

## Troubleshooting [![Gitter](http://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/bkimminich/juice-shop)

> If you need help with the application setup please check the
> Troubleshooting section below or post your specific problem or
> question in the
> [official Gitter Chat](https://gitter.im/bkimminich/juice-shop).

- If using Docker Toolbox on Windows make sure that you also enable port
  forwarding for all required ports from Host `127.0.0.1:XXXX` to
  `0.0.0.0:XXXX` for TCP in the `default` VM's network adapter in
  VirtualBox. For CTFd you need to forward port `8000`.

## Contributing [![GitHub contributors](https://img.shields.io/github/contributors/bkimminich/juice-shop-ctf.svg)](https://github.com/bkimminich/juice-shop-ctf/graphs/contributors)

Found a bug? Got an idea for enhancement? Improvement for cheating
prevention?

Feel free to
[create an issue](https://github.com/bkimminich/juice-shop-ctf/issues)
or
[post your ideas in the chat](https://gitter.im/bkimminich/juice-shop)!
Pull requests are also highly welcome - please refer to
[CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Donations

### PayPal [![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=BM&item_name=OWASP%20Juice%20Shop%20Project&item_number=OWASP%20Foundation&no_note=0&currency_code=USD&bn=PP%2dDonationsBF)

PayPal donations via above button go to the OWASP Foundations and are
earmarked for "Juice Shop". This is the preferred and most convenient
way to support the project.

### Credit Card (through RegOnline)

OWASP hosts a
[donation form on RegOnline](https://www.regonline.com/Register/Checkin.aspx?EventID=1044369).
Refer to the
[Credit card donation step-by-step](https://pwning.owasp-juice.shop/part3/donations.html#credit-card-donation-step-by-step)
guide for help with filling out the donation form correctly.

## Contributors

The OWASP Juice Shop core project team are:

- [Björn Kimminich](https://github.com/bkimminich) aka `bkimminich`
  ([Project Leader](https://www.owasp.org/index.php/Projects/Project_Leader_Responsibilities))
- [Jannik Hollenbach](https://github.com/J12934) aka `J12934`
- [Timo Pagel](https://github.com/wurstbrot) aka `wurstbrot`

### Code Contributors

Based on [GitHub](https://github.com/bkimminich/juice-shop-ctf) commits
on `master` as of Tue, 10 Apr 2018

- [Josh Grossman](httpps://github.com/tghosth) aka `tghosth`
- [Simon Basset](https://github.com/simbas) aka `simbas`

## Licensing [![license](https://img.shields.io/github/license/bkimminich/juice-shop-ctf-server.svg)](LICENSE)

This program is free software: you can redistribute it and/or modify it
under the terms of the [MIT license](LICENSE). OWASP Juice Shop and any
contributions are Copyright © by Bjoern Kimminich 2016-2019.

![Juice Shop CTF Logo](https://raw.githubusercontent.com/bkimminich/juice-shop-ctf/develop/images/JuiceShopCTF_Logo_400px.png)
