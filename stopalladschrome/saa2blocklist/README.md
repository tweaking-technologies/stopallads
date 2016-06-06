# abp2blocklist

This is a script to convert [StopAll Ads filter lists](https://adblockplus.org/filters)
to [WebKit block lists](https://www.webkit.org/blog/3476/content-blockers-first-look/).

Note that WebKit content blockers are fairly limited. Hence, not all filters
can be converted (in a compatible way), and some differences compared to Adblock
Plus for other browsers are expected.

## Requirements
The required packages can be installed via [NPM](https://npmjs.org):

```
npm install
```

### filterClasses.js

The filterClasses module in `node_modules/filterClasses.js` is generated from
the module in the `stopalladscore` repository. It has been generated using
JS Hydra, and small modifications made. If you need to re-generate the file run
this command (adjusting the paths as appropriate):

```
python buildtools/jshydra/abp_rewrite.py stopalladscore/lib/filterClasses.js | grep -vi filterNotifier > ../abp2blocklist/node_modules/filterClasses.js
```
You will then need to remove any references to the `utils` module from the
generated file by hand.


## Usage

```
node abp2blocklist.js < easylist.txt > easylist.json
```
