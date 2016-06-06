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

/** @module stats */

let {Prefs} = require("prefs");
let {BlockingFilter} = require("filterClasses");
let {FilterNotifier} = require("filterNotifier");

let badgeColor = "#646464";
let blockedPerPage = new ext.PageMap();

/**
 * Gets the number of requests blocked on the given page.
 *
 * @param  {Page} page
 * @return {Number}
 */
exports.getBlockedPerPage = function(page)
{
  return blockedPerPage.get(page) || 0;
};

FilterNotifier.on("filter.hitCount", (filter, newValue, oldValue, page) =>
{
  if (!(filter instanceof BlockingFilter) || !page)
    return;

  Prefs.blocked_total++;

  let blocked = blockedPerPage.get(page) || 0;
  blockedPerPage.set(page, ++blocked);

  // Update number in icon
  if (Prefs.show_statsinicon)
  {
    page.browserAction.setBadge({
      color: badgeColor,
      number: blocked
    });
  }
});

Prefs.on("show_statsinicon", () =>
{
  ext.pages.query({}, function(pages)
  {
    for (var i = 0; i < pages.length; i++)
    {
      let page = pages[i];
      let badge = null;

      if (Prefs.show_statsinicon)
      {
        let blocked = blockedPerPage.get(page);
        if (blocked)
        {
          badge = {
            color: badgeColor,
            number: blocked
          };
        }
      }

      page.browserAction.setBadge(badge);
    }
  });
});
