# Glitch Polyam Edition

> Mastodon, but better!

This project started as a fork of [glitch-soc](https://github.com/glitch-soc/mastodon), which itself is a fork of Mastodon, but strives to provide even more features and provide an overall better experience.

## Features

A full list of changes can be found [on the wiki](https://github.com/polyamspace/mastodon/wiki)

### Emoji reactions

Want to give a toot a thumbs up? Show your love with a custom emoji? \
With polyam-glitch you can! \
React to toots with emojis and custom emojis.

### Alt-text modal

Want to read alt-text without awkwardly hovering over an image? \
Click the alt label and read the alt-text in a modal. \
This also works for audio and video attachments.

### Syntax highlighting for code blocks

Code is far easier to read with syntax highlighting. \
So write a code block similar to how you do on GitHub and see your code highlighted.

### Custom notification sounds

Users can choose between notification sounds and admins can add their own. \
No more replacing the default sound file.

### Additional themes

Polyam-glitch comes with 2 additional themes by default: \
Fairy Floss and Homogay.

### Polyam flavour

Polyam-glitch comes with its own flavour based on the glitch flavour. \
All features are available for it.

## Installation and updating

### Installing from scratch

Installation is the same as described in the [Mastodon documentation](https://docs.joinmastodon.org/admin/install/) \
Replace the repo URL with this one.

### Switching to Polyam-glitch

It is possible to switch from vanilla and glitch-soc to polyam-glitch the same way as switching from vanilla to glitch-soc. \
Please read the [glitch-soc docs](https://glitch-soc.github.io/docs/) for instructions. \
Replace the glitch-soc repo with this one. \
Alternatively, while primarily intended for updating existing polyam-glitch installations, the [update script](https://github.com/polyamspace/scripts/blob/main/update.sh) can be used.

Switching from other forks might require some manual adjustments due to duplicate migrations. \
Especially forks running upstream's status reactions PR as polyam-glitch's version is based on a prior iteration of it.

### Switching from Polyam-glitch

It is technically possible to switch to other forks. \
This comes with a few caveats (some are mentioned in the upstream docs) and not every scenario can be accounted for. \
Do this at your own risk. \
Keep in mind that downgrades (switching to older code) are not supported.
