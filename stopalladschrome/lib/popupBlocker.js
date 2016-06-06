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

/** @module popupBlocker */

"use strict";

let {defaultMatcher} = require("matcher");
let {BlockingFilter} = require("filterClasses");
let {stringifyURL, isThirdParty, extractHostFromFrame} = require("url");
let {checkWhitelisted} = require("whitelisting");
let {logRequest} = require("devtools");

let loadingPopups = Object.create(null);

function hasLoadingPopups()
{
  return Object.keys(loadingPopups).length > 0;
}

function forgetPopup(tabId)
{
  delete loadingPopups[tabId];

  if (!hasLoadingPopups())
  {
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
    chrome.webNavigation.onCompleted.removeListener(onCompleted);
    chrome.tabs.onRemoved.removeListener(forgetPopup);
  }
}

function getFrame(tabId, processId, frameId, callback)
{
  chrome.webNavigation.getFrame(
    {
      tabId: tabId,
      processId: processId,
      frameId: frameId
    },
    details =>
    {
      let {url, parentFrameId} = details;
      let frame = {url: new URL(url), parent: null};

      if (parentFrameId != -1)
      {
        getFrame(
          tabId, processId, parentFrameId,
          parentFrame =>
          {
            frame.parent = parentFrame;
            callback(frame);
          }
        );
      }
      else
      {
        callback(frame);
      }
    }
  );
}

function checkPotentialPopup(tabId, popup)
{
  let urlObj = new URL(popup.url || "about:blank");
  let urlString = stringifyURL(urlObj);
  let documentHost = extractHostFromFrame(popup.sourceFrame);
  let thirdParty = isThirdParty(urlObj, documentHost);

  let specificOnly = !!checkWhitelisted(
    popup.sourcePage, popup.sourceFrame,
    RegExpFilter.typeMap.GENERICBLOCK
  );

  let filter = defaultMatcher.matchesAny(
    urlString, RegExpFilter.typeMap.POPUP,
    documentHost, thirdParty, null, specificOnly
  );

  if (filter instanceof BlockingFilter)
    chrome.tabs.remove(tabId);

  logRequest(
    popup.sourcePage, urlString, "POPUP",
    documentHost, thirdParty, null,
    specificOnly, filter
  );
}

function onBeforeRequest(details)
{
  let popup = loadingPopups[details.tabId];
  if (popup)
  {
    popup.url = details.url;
    if (popup.sourceFrame)
      checkPotentialPopup(details.tabId, popup);
  }
}

function onCompleted(details)
{
  if (details.frameId == 0 && details.url != "about:blank")
    forgetPopup(details.tabId);
}

function onSourceFrameRetrieved(tabId, frame)
{
  let popup = loadingPopups[tabId];
  if (popup)
  {
    if (checkWhitelisted(popup.sourcePage, frame))
    {
      forgetPopup(tabId);
    }
    else
    {
      popup.sourceFrame = frame;
      checkPotentialPopup(tabId, popup);
    }
  }
}

chrome.webNavigation.onCreatedNavigationTarget.addListener(details =>
{
  if (!hasLoadingPopups())
  {
    chrome.webRequest.onBeforeRequest.addListener(
      onBeforeRequest,
      {
        urls:  ["<all_urls>"],
        types: ["main_frame"]
      }
    );

    chrome.webNavigation.onCompleted.addListener(onCompleted);
    chrome.tabs.onRemoved.addListener(forgetPopup);
  }

  loadingPopups[details.tabId] = {
    url: details.url,
    sourcePage: new ext.Page({id: details.sourceTabId}),
    sourceFrame: null
  };

  getFrame(
    details.sourceTabId,
    details.sourceProcessId,
    details.sourceFrameId,
    onSourceFrameRetrieved.bind(null, details.tabId)
  );
});
