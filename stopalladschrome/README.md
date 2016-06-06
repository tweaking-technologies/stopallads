StopAll Ads for Chrome
======================

This repository contains the platform-specific StopAll Ads source code for
Chrome. It can be used to build StopAll Ads for these
platforms, generic StopAll Ads code will be extracted from other repositories
automatically (see _dependencies_ file).

Building
---------

### Requirements

- [Mercurial](https://www.mercurial-scm.org/) or [Git](https://git-scm.com/) (whichever you used to clone this repository)
- [Python 2.7](https://www.python.org)
- [The Jinja2 module](http://jinja.pocoo.org/docs)
- [The PIL module](http://www.pythonware.com/products/pil/)
- For signed Chrome builds: [M2Crypto module](https://github.com/martinpaljak/M2Crypto)

### Building the extension

Run following command in the project directory, depending on your
target platform:

    build.py -t chrome build

This will create a build with a name in the form
stopallads-1.0.XX.zip