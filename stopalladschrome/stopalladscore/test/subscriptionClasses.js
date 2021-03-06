/*
#* This file is part of StopAll Ads <http://www.stopallads.com/>,
#* Copyright (C) 2016 Tweaking Techonologies

#* StopAll Ads is a fork of the Adblock Plus extension for 
#* blocking advertisements on the web. 
#* This fork will provide the same features as Adblock Plus

#* StopAll Ads is distributed in the hope that it will be useful,
#* but WITHOUT ANY WARRANTY; without even the implied warranty of
#* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#* GNU General Public License for more details.
#*
#* You should have received a copy of the GNU General Public License
#* along with StopAll Ads.  If not, see <http://www.gnu.org/licenses/>.


#Originally Contributed by:
 #* This file is part of Adblock Plus <https://adblockplus.org/>,
 #* Copyright (C) 2006-2016 Eyeo GmbH
 #*
 #* Adblock Plus is free software: you can redistribute it and/or modify
 #* it under the terms of the GNU General Public License version 3 as
 #* published by the Free Software Foundation.
 #*
 #* Adblock Plus is distributed in the hope that it will be useful,
 #* but WITHOUT ANY WARRANTY; without even the implied warranty of
 #* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 #* GNU General Public License for more details.
 #*
 #* You should have received a copy of the GNU General Public License
 #* along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

let {
  Subscription, SpecialSubscription, DownloadableSubscription,
  RegularSubscription, ExternalSubscription
} = require("../lib/subscriptionClasses");

function compareSubscription(test, url, expected, postInit)
{
  expected.push("[Subscription]")
  let subscription = Subscription.fromURL(url);
  if (postInit)
    postInit(subscription)
  let result = [];
  subscription.serialize(result);
  test.equal(result.sort().join("\n"), expected.sort().join("\n"), url);

  let map = Object.create(null);
  for (let line of result.slice(1))
  {
    if (/(.*?)=(.*)/.test(line))
      map[RegExp.$1] = RegExp.$2;
  }
  let subscription2 = Subscription.fromObject(map);
  test.equal(subscription.toString(), subscription2.toString(), url + " deserialization");
}

exports.testSubscriptionClassDefinitions = function(test)
{
  test.equal(typeof Subscription, "function", "typeof Subscription");
  test.equal(typeof SpecialSubscription, "function", "typeof SpecialSubscription");
  test.equal(typeof RegularSubscription, "function", "typeof RegularSubscription");
  test.equal(typeof ExternalSubscription, "function", "typeof ExternalSubscription");
  test.equal(typeof DownloadableSubscription, "function", "typeof DownloadableSubscription");

  test.done();
};

exports.testSubscriptionsWithState = function(test)
{
  compareSubscription(test, "~fl~", ["url=~fl~"]);
  compareSubscription(test, "http://test/default", ["url=http://test/default", "title=http://test/default"]);
  compareSubscription(test, "http://test/default_titled", ["url=http://test/default_titled", "title=test"], function(subscription)
  {
    subscription.title = "test";
  });
  compareSubscription(test, "http://test/non_default", ["url=http://test/non_default", "title=test",
                                                  "disabled=true", "lastSuccess=8", "lastDownload=12", "lastCheck=16", "softExpiration=18", "expires=20", "downloadStatus=foo",
                                                  "errors=3", "version=24", "requiredVersion=0.6"], function(subscription)
  {
    subscription.title = "test";
    subscription.disabled = true;
    subscription.lastSuccess = 8;
    subscription.lastDownload = 12;
    subscription.lastCheck = 16;
    subscription.softExpiration = 18;
    subscription.expires = 20;
    subscription.downloadStatus = "foo";
    subscription.errors = 3;
    subscription.version = 24
    subscription.requiredVersion = "0.6";
  });
  compareSubscription(test, "~wl~", ["url=~wl~", "disabled=true", "title=Test group"], function(subscription)
  {
    subscription.title = "Test group";
    subscription.disabled = true;
  });

  test.done();
};
