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

"use strict";

// In Chrome 37-40, the document_end content script (this one) runs properly,
// while the document_start content scripts (that defines ext) might not. Check
// whether variable ext exists before continuing to avoid
// "Uncaught ReferenceError: ext is not defined". See https://crbug.com/416907
if ("ext" in window && document instanceof HTMLDocument)
{
  document.addEventListener("click", function(event)
  {
    // Ignore right-clicks
    if (event.button == 2)
      return;

    // Ignore simulated clicks.
    if (event.isTrusted == false)
      return;

    // Search the link associated with the click
    var link = event.target;
    while (!(link instanceof HTMLAnchorElement))
    {
      link = link.parentNode;

      if (!link)
        return;
    }

    if (link.protocol == "http:" || link.protocol == "https:")
    {
      if (link.host != "subscribe.stopallads.com" || link.pathname != "/")
        return;
    }
    else if (!/^abp:\/*subscribe\/*\?/i.test(link.href))
      return;

    // This is our link - make sure the browser doesn't handle it
    event.preventDefault();
    event.stopPropagation();

    // Decode URL parameters
    var params = link.search.substr(1).split("&");
    var title = null;
    var url = null;
    for (var i = 0; i < params.length; i++)
    {
      var parts = params[i].split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1]))
        continue;
      switch (parts[0])
      {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url)
      return;

    // Default title to the URL
    if (!title)
      title = url;

    // Trim spaces in title and URL
    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url))
      return;

    ext.backgroundPage.sendMessage({
      type: "subscriptions.add",
      title: title,
      url: url,
      confirm: true
    });
  }, true);
}
