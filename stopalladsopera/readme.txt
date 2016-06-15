Prerequisites to upload Opera extension to webstore:

dashboard url:
https://addons.opera.com/developer/extensions/details/stopall-ads/1.0.90/

username: dev@tweakingtechnologies.com

Product Name: StopAll Ads
Company: Tweaking Technologies
weblink: http://www.stopallads.com
company website: http://www.tweakingtechnologies.com/

steps to build opera ext:
1. cmd (admin mode)
2. move to directory path of chrome repository
3. > build.py -t chrome build -r (release build)
4. version update:
	metadata.common > 
	[general]
	
version = 1.0.91
5. delete all locales except "en_US" and "en_GB" and create new zip file.
6. verify each content again to ensure that text is specific to Opera browser.
7. verify privacypolicy / support / homepage / adblock plus acknowledgement / licence etc
8. verify images
9. verify version number
