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

let {XPCOMUtils} = Cu.import("resource://gre/modules/XPCOMUtils.jsm", null);
let {Services} = Cu.import("resource://gre/modules/Services.jsm", null);

let {_EventTarget: EventTarget} = require("ext_common");
let {port} = require("messaging");

exports.onMessage = new EventTarget(port);

function Page(windowID)
{
  this._windowID = windowID;
}
Page.prototype = {
  sendMessage: function(payload)
  {
    port.emit("ext_message", {targetID: this._windowID, payload});
  }
};
exports.Page = Page;

function PageMap()
{
  this._map = new Map();

  port.on("ext_disconnect", windowID => this._map.delete(windowID));
}
PageMap.prototype = {
  keys: function()
  {
    let result = [];
    for (let windowID of this._map.keys())
      result.push(new Page(windowID));
    return result;
  },

  get: function(page)
  {
    return this._map.get(page._windowID);
  },

  set: function(page, value)
  {
    this._map.set(page._windowID, value);
  },

  has: function(page)
  {
    return this._map.has(page._windowID);
  },

  delete: function(page)
  {
    return this._map.delete(page._windowID);
  }
};
exports.PageMap = PageMap;

exports.showOptions = function()
{
  require("ui").UI.openFiltersDialog();
};
