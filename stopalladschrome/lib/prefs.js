/*
* This file is part of StopAll Ads <http://www.stopallads.com/>,
* Copyright (C) 2016 Tweaking Techonologies

* StopAll Ads is a fork of the Adblock Plus extension for 
* blocking advertisements on the web. 
* This fork will provide the same features as Adblock Plus

* StopAll Ads is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with StopAll Ads.  If not, see <http://www.gnu.org/licenses/>.


#Originally Contributed by:
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-2016 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>. 
 */

/** @module prefs */

let {EventEmitter} = require("events");

const keyPrefix = "pref:";

let eventEmitter = new EventEmitter();
let overrides = Object.create(null);

/** @lends module:prefs.Prefs */
let defaults = Object.create(null);

/**
 * Only for compatibility with core code. Please do not change!
 *
 * @type {boolean}
 */
defaults.enabled = true;
/**
 * The application version as set during initialization. Used to detect updates.
 *
 * @type {string}
 */
defaults.currentVersion = "";
/**
 * Only for compatibility with core code. Please do not change!
 *
 * @type {string}
 */
defaults.data_directory = "";
/**
 * @see http://www.stopallads.com/en/preferences#patternsbackups
 * @type {number}
 */
defaults.patternsbackups = 5;
/**
 * @see http://www.stopallads.com/en/preferences#patternsbackupinterval
 * @type {number}
 */
defaults.patternsbackupinterval = 24;
/**
 * Only for compatibility with core code. Please do not change!
 *
 * @type {boolean}
 */
defaults.savestats = false;
/**
 * Only for compatibility with core code. Please do not change!
 *
 * @type {boolean}
 */
defaults.privateBrowsing = false;
/**
 * @see http://www.stopallads.com/en/preferences#subscriptions_fallbackerrors
 * @type {number}
 */
defaults.subscriptions_fallbackerrors = 5;
/**
 * @see http://www.stopallads.com/en/preferences#subscriptions_fallbackurl
 * @type {string}
 */
defaults.subscriptions_fallbackurl = "http://www.stopallads.com/getSubscription?version=%VERSION%&url=%SUBSCRIPTION%&downloadURL=%URL%&error=%ERROR%&channelStatus=%CHANNELSTATUS%&responseStatus=%RESPONSESTATUS%";
/**
 * @see http://www.stopallads.com/en/preferences#subscriptions_autoupdate
 * @type {boolean}
 */
defaults.subscriptions_autoupdate = true;
/**
 * @see http://www.stopallads.com/en/preferences#subscriptions_exceptionsurl
 * @type {string}
 */
 defaults.subscriptions_easyprivacy= "http://stopallads.s3.amazonaws.com/subscriptions/easyprivacy_easylist.txt";
 /**
 * @see http://stopallads.s3.amazonaws.com/subscriptions/easyprivacy_easylist.txt
 * @type {string}
 */
  defaults.subscriptions_easylistadware= "http://stopallads.s3.amazonaws.com/subscriptions/adwarefilters.txt";
 /**
 * @see http://stopallads.s3.amazonaws.com/subscriptions/easyprivacy_easylist.txt
 * @type {string}
 */
	
defaults.subscriptions_exceptionsurl = "http://stopallads.s3.amazonaws.com/subscriptions/exceptionrules.txt";
/**
 * @see http://www.stopallads.com/en/preferences#subscriptions_antiadblockurl
 * @type {string}
 */
defaults.subscriptions_antiadblockurl = "http://stopallads.s3.amazonaws.com/subscriptions/antiadblockfilters.txt";
/**
 * @see http://www.stopallads.com/en/preferences#documentation_link
 * @type {string}
 */
defaults.documentation_link = "http://www.stopallads.com/redirect?link=%LINK%&lang=%LANG%";
/**
 * @see http://www.stopallads.com/en/preferences#notificationdata
 * @type {object}
 */
defaults.notificationdata = {};
/**
 * @see http://www.stopallads.com/en/preferences#notificationurl
 * @type {string}
 */
defaults.notificationurl = "http://stopallads.s3.amazonaws.com/subscriptions/notification.json";
/**
 * The total number of requests blocked by the extension.
 *
 * @type {number}
 */
defaults.blocked_total = 0;
/**
 * Whether to show a badge in the toolbar icon indicating the number of blocked ads.
 *
 * @type {boolean}
 */
defaults.show_statsinicon = true;
/**
 * Whether to show the number of blocked ads in the popup.
 *
 * @type {boolean}
 */
defaults.show_statsinpopup = true;
/**
 * Whether to show the "Block element" context menu entry.
 *
 * @type {boolean}
 */
defaults.shouldShowBlockElementMenu = true;
/**
 * Whether to collapse placeholders for blocked elements.
 *
 * @type {boolean}
 */
defaults.hidePlaceholders = true;

/**
 * Whether notification opt-out UI should be shown.
 * @type {boolean}
 */
defaults.notifications_showui = false;

/**
 * Notification categories to be ignored.
 *
 * @type {string[]}
 */
defaults.notifications_ignoredcategories = [];

/**
 * Whether to show the developer tools panel.
 *
 * @type {boolean}
 */
defaults.show_devtools_panel = true;

/**
 * Whether to suppress the first run page. This preference isn't
 * set by the extension but can be pre-configured externally.
 *
 * @see https://adblockplus.org/development-builds/suppressing-the-first-run-page-on-chrome
 * @type {boolean}
 */
defaults.suppress_first_run_page = false;

/**
 * Additonal subscriptions to be automatically added when the extension is
 * loaded. This preference isn't set by the extension but can be pre-configured
 * externally.
 *
 * @type {string[]}
 */
defaults.additional_subscriptions = [];

/**
 * Whether to enable the use of Safari's content blocker mechanism.
 */
defaults.safariContentBlocker = false;

/**
  * @namespace
  * @static
  */
let Prefs = exports.Prefs = {
  /**
   * Adds a callback that is called when the
   * value of a specified preference changed.
   *
   * @param {string}   preference
   * @param {function} callback
   */
  on: function(preference, callback)
  {
    eventEmitter.on(preference, callback);
  },

  /**
   * Removes a callback for the specified preference.
   *
   * @param {string}   preference
   * @param {function} callback
   */
  off: function(preference, callback)
  {
    eventEmitter.off(preference, callback);
  },

  /**
   * A promise that is fullfilled when all preferences have been loaded.
   * Wait for this promise to be fulfilled before using preferences during
   * extension initialization.
   *
   * @type {Promise}
   */
  untilLoaded: null
};

function keyToPref(key)
{
  if (key.indexOf(keyPrefix) != 0)
    return null;

  return key.substr(keyPrefix.length);
}

function prefToKey(pref)
{
  return keyPrefix + pref;
}

function addPreference(pref)
{
  Object.defineProperty(Prefs, pref, {
    get: function()
    {
      return (pref in overrides ? overrides : defaults)[pref];
    },
    set: function(value)
    {
      let defaultValue = defaults[pref];

      if (typeof value != typeof defaultValue)
        throw new Error("Attempt to change preference type");

      if (value == defaultValue)
      {
        delete overrides[pref];
        ext.storage.remove(prefToKey(pref));
      }
      else
      {
        overrides[pref] = value;
        ext.storage.set(prefToKey(pref), value);
      }
    },
    enumerable: true
  });
}

function init()
{
  let prefs = Object.keys(defaults);
  prefs.forEach(addPreference);

  let localLoaded = new Promise(resolve => {
    ext.storage.get(prefs.map(prefToKey), function(items)
    {
      for (let key in items)
        overrides[keyToPref(key)] = items[key];

      resolve();
    });
  });

  let managedLoaded = new Promise(resolve => {
    if (require("info").platform == "chromium" && "managed" in chrome.storage)
    {
      chrome.storage.managed.get(null, function(items)
      {
        // Opera doesn't support chrome.storage.managed, but instead simply
        // removing the API, Opera sets chrome.runtime.lastError when using it.
        // So we have to retrieve that error, to prevent it from showing up
        // in the console.
        chrome.runtime.lastError;

        for (let key in items)
          defaults[key] = items[key];

        resolve();
      });
    }
    else
    {
      resolve();
    }
  });

  function onLoaded()
  {
    ext.storage.onChanged.addListener(function(changes)
    {
      for (let key in changes)
      {
        let pref = keyToPref(key);
        if (pref && pref in defaults)
        {
          let change = changes[key];
          if ("newValue" in change && change.newValue != defaults[pref])
            overrides[pref] = change.newValue;
          else
            delete overrides[pref];

          eventEmitter.emit(pref);
        }
      }
    });
  }

  Prefs.untilLoaded = Promise.all([localLoaded, managedLoaded]).then(onLoaded);
}

init();
