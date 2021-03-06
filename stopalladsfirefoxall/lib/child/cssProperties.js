/*

* This file is part of Stop All Ads <http://www.stopallads.com/>,
* Copyright (C) 2016 Tweaking Techonologies

* Stop All Ads is a fork of the Adblock Plus version 2.7.3 extension for 
* blocking advertisements on the web. 
* This fork will provide the same features as Adblock Plus

* Stop All Ads is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Stop All Ads.  If not, see <http://www.gnu.org/licenses/>.


Originally Contributed by:
 * This file is part of Adblock Plus <https://stopallads.org/>,
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

(function()
{
  let {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

  let {port} = require("messaging");
  let {getFrames} = require("child/utils");

  function getFilters(window, callback)
  {
    let message = {
      frames: getFrames(window),
      payload: {
        type: "filters.get",
        what: "cssproperties"
      }
    };
    port.emitWithResponse("ext_message", message).then(callback);
  }

  function addUserCSS(window, cssCode)
  {
    let uri = Services.io.newURI("data:text/css," + encodeURIComponent(cssCode),
        null, null);
    let utils = window.QueryInterface(Ci.nsIInterfaceRequestor)
                      .getInterface(Ci.nsIDOMWindowUtils);
    utils.loadSheet(uri, Ci.nsIDOMWindowUtils.USER_SHEET);
  }

  function initCSSPropertyFilters()
  {
    let scope = {};
    Services.scriptloader.loadSubScript(
        "chrome://stopallads/content/cssProperties.js", scope);

    let onContentWindow = (subject, topic, data) =>
    {
      if (!(subject instanceof Ci.nsIDOMWindow))
        return;

      let onReady = event =>
      {
        subject.removeEventListener("load", onReady);
        let handler = new scope.CSSPropertyFilters(
          subject, getFilters.bind(null, subject), selectors =>
          {
            if (selectors.length == 0)
              return;

            addUserCSS(subject, selectors.map(
              selector => selector + "{display: none !important;}"
            ).join("\n"));
          }
        );

        handler.load(() => handler.apply());
      };

      subject.addEventListener("load", onReady);
    };

    Services.obs.addObserver(onContentWindow, "content-document-global-created",
        false);
    onShutdown.add(() =>
    {
      Services.obs.removeObserver(onContentWindow,
          "content-document-global-created");
    });
  }

  initCSSPropertyFilters();
})();
