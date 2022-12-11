#  Mastodon Glitch Edition  #

>   Now with automated deploys!

[![Build Status](https://img.shields.io/circleci/project/github/glitch-soc/mastodon.svg)][circleci]
[![Code Climate](https://img.shields.io/codeclimate/maintainability/glitch-soc/mastodon.svg)][code_climate]

[circleci]: https://circleci.com/gh/glitch-soc/mastodon
[code_climate]: https://codeclimate.com/github/glitch-soc/mastodon

So here's the deal: we all work on this code, and anyone who uses that does so absolutely at their own risk. can you dig it?

- You can view documentation for this project at [glitch-soc.github.io/docs/](https://glitch-soc.github.io/docs/).
- And contributing guidelines are available [here](CONTRIBUTING.md) and [here](https://glitch-soc.github.io/docs/contributing/).

## Additional changes
- Fix Lint Code Base from failing ([4883cec](https://github.com/polyamspace/mastodon/commit/4883ceca81d5b7909e196727ce75c29fb1c5038f))
- Fix Vagrantfile ([69de91a](https://github.com/polyamspace/mastodon/commit/69de91a94c3e2f19a5c55722c3cdd639a0a6fb9d))


### Admin features
- Add option to limit max number of uses for invites to 1 ([c626e09](https://github.com/polyamspace/mastodon/commit/c626e09c3907e0f1a0b1d1f47aadb2dcb50efc29))
- Add option to make landing page /about ([25131ba](https://github.com/polyamspace/mastodon/commit/25131baa59caad3976378a91278b6ba30c685274))
- Add option to disable search for logged out users ([9bcf12b](https://github.com/polyamspace/mastodon/commit/9bcf12bf10e32d41b90f6b0d64613f096f8b8fe7))
- Add account request text filter ([PR #2](https://github.com/polyamspace/mastodon/pull/2))
- Add dropdown menu item to open admin interface for remote domains ([PR #8](https://github.com/polyamspace/mastodon/pull/8))
- Add setting to customise favicon ([PR #7](https://github.com/polyamspace/mastodon/pull/7))
- Add admin user setting override ([PR #9](https://github.com/polyamspace/mastodon/pull/9))

### Features
- Add exclusive lists ([PR #1](https://github.com/polyamspace/mastodon/pull/1))
- Add new sounds and allow user to select notification sound ([PR #3](https://github.com/polyamspace/mastodon/pull/3))
- Add setting to disable RSS feed ([PR #11](https://github.com/polyamspace/mastodon/pull/11))

### UI changes
- Add missing column header to about ([2c0af93](https://github.com/polyamspace/mastodon/commit/2c0af93e4e8d969861a978e8fc042b77b25faf6d))
- Add role badges to web interface ([543301a](https://github.com/polyamspace/mastodon/commit/543301a5c09485f91a1ef976f5404182dd2d2354), [d86bef9](https://github.com/polyamspace/mastodon/commit/d86bef912d3a9e76ce79ed5778d83ad60780bcc0), [9edeb60](https://github.com/polyamspace/mastodon/commit/9edeb6087908e21a257854a7424c5e58148e4323))
- Rename "Publish" to "Toot" ([7357b83](https://github.com/polyamspace/mastodon/commit/7357b8379f05182bf64b6f6e420cf5a93f91820e))
- Re-add comments to invite form ([e22f6c6](https://github.com/polyamspace/mastodon/commit/e22f6c69aff4a450220e7c83b8181b7c60fbccd4))
- Use a different icon for threads ([891b870](https://github.com/polyamspace/mastodon/commit/891b870cec03213a561593d83afad9f77b13beb3))
- Add missing logout link to footer ([99bfd89](https://github.com/polyamspace/mastodon/commit/99bfd89dc9cc54e0c6073e449215e9ef63b84150))
- Show instance description in about when available ([0084e59](https://github.com/polyamspace/mastodon/commit/0084e592f1cb8061738d5ea81e16a1292457c163))
- Add missing column header to privacy policy ([19230fb](https://github.com/polyamspace/mastodon/commit/19230fb7d678ec1a3d4896273491c6c2e4f2ffa3))
- Replace "Get the app" with "Documentation" in footer ([b991737](https://github.com/polyamspace/mastodon/commit/b99173737d85ba5a0f881d688f8203c44646c4f1))
- Remove frontend limit of featured tags ([PR #4](https://github.com/polyamspace/mastodon/pull/4))
- Add visual indicator that image has alt text ([PR #5](https://github.com/polyamspace/mastodon/pull/5))
- Fix missing link style in admin.scss ([upstream/#1999](https://github.com/glitch-soc/mastodon/pull/1999))
- Add page for followed hashtags ([PR #6](https://github.com/polyamspace/mastodon/pull/6))
