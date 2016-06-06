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

(function()
{
  var subscriptionsMap = Object.create(null);
  var recommendationsMap = Object.create(null);
  var filtersMap = Object.create(null);
  var collections = Object.create(null);

  function Collection(details)
  {
    this.details = details;
    this.items = [];
  }

  Collection.prototype.addItems = function() 
  {
    var length = Array.prototype.push.apply(this.items, arguments);
    if (length == 0)
      return;

    this.items.sort(function(a, b)
    {
      var aValue = (a.title || a.text || a.url).toLowerCase();
      var bValue = (b.title || b.text || b.url).toLowerCase();
      return aValue.localeCompare(bValue);
    });

    for (var j = 0; j < this.details.length; j++) 
    {
      var table = E(this.details[j].id);
      var template = table.querySelector("template");
      for (var i = 0; i < arguments.length; i++) 
      {
        var item = arguments[i];
        var text = item.title || item.url || item.text;
        var listItem = document.createElement("li");
        listItem.appendChild(document.importNode(template.content, true));
        listItem.setAttribute("data-access", item.url || item.text);
        listItem.querySelector(".display").textContent = text;
        if (text)
          listItem.setAttribute("data-search", text.toLowerCase());

        var control = listItem.querySelector(".control");
        if (control)
        {
          control.addEventListener("click", this.details[j].onClick, false);
          control.checked = item.disabled == false;
        }

        if (table.hasChildNodes())
          table.insertBefore(listItem, table.childNodes[this.items.indexOf(item)]);
        else
          table.appendChild(listItem);
      }
    }
    return length;
  };

  Collection.prototype.removeItem = function(item)
  {
    var index = this.items.indexOf(item);
    if (index == -1)
      return;

    this.items.splice(index, 1);
    var access = (item.url || item.text).replace(/'/g, "\\'");
    for (var i = 0; i < this.details.length; i++)
    {
      var table = E(this.details[i].id);
      var element = table.querySelector("[data-access='" + access + "']");
      element.parentElement.removeChild(element);
    }
  };

  Collection.prototype.clearAll = function()
  {
    for (var i = 0; i < this.details.length; i++)
    {
      var table = E(this.details[i].id);
      var template = table.querySelector("template");
      table.innerHTML = "";
      table.appendChild(template);
    }
    this.items.length = 0;
  };

  function onToggleSubscriptionClick(e)
  {
    e.preventDefault();
    var subscriptionUrl = e.target.parentNode.getAttribute("data-access");
    if (!e.target.checked)
    {
       ext.backgroundPage.sendMessage(
        {
          type: "subscriptions.remove",
          url: subscriptionUrl
        });
    }
    else
      addEnableSubscription(subscriptionUrl);
  }

  function onAddLanguageSubscriptionClick(e)
  {
    e.preventDefault();
    var url = this.parentNode.getAttribute("data-access");
    addEnableSubscription(url);
  }

  function onRemoveFilterClick()
  {
    var filter = this.parentNode.getAttribute("data-access");
    ext.backgroundPage.sendMessage(
    {
      type: "filters.remove",
      text: filter
    });
  }

  collections.popular = new Collection(
  [
    {
      id: "recommend-list-table",
      onClick: onToggleSubscriptionClick
    }
  ]);
  collections.langs = new Collection(
  [
    {
      id: "blocking-languages-table",
      onClick: onToggleSubscriptionClick
    },
    {
      id: "blocking-languages-dialog-table"
    }
  ]);
  collections.allLangs = new Collection(
  [
    {
      id: "all-lang-table", 
      onClick: onAddLanguageSubscriptionClick
    }
  ]);
  collections.acceptableAds = new Collection(
  [
    {
      id: "acceptableads-table", 
      onClick: onToggleSubscriptionClick
    }
  ]);
  collections.custom = new Collection(
  [
    {
      id: "custom-list-table", 
      onClick: onToggleSubscriptionClick
    }
  ]);
  collections.whitelist = new Collection(
  [
    {
      id: "whitelisting-table", 
      onClick: onRemoveFilterClick
    }
  ]);
  collections.customFilters = new Collection(
  [
    {
      id: "custom-filters-table"
    }
  ]);

  function updateSubscription(subscription)
  {
    var subscriptionUrl = subscription.url;
    var knownSubscription = subscriptionsMap[subscriptionUrl];
    if (knownSubscription)
      knownSubscription.disabled = subscription.disabled;
    else
    {
      getAcceptableAdsURL(function(acceptableAdsUrl)
      {
        function onObjectChanged()
        {
          var access = (subscriptionUrl || subscription.text).replace(/'/g, "\\'");
          var elements = document.querySelectorAll("[data-access='" + access + "']");
          for (var i = 0; i < elements.length; i++)
          {
            var element = elements[i];
            var control = element.querySelector(".control");
            if (control.localName == "input")
              control.checked = subscription.disabled == false;
            if (subscriptionUrl in recommendationsMap)
            {
              var recommendation = recommendationsMap[subscriptionUrl];
              if (recommendation.isAdsType)
              {
                if (subscription.disabled == false)
                {
                  collections.allLangs.removeItem(subscription);
                  collections.langs.addItems(subscription);
                }
                else
                {
                  collections.allLangs.addItems(subscription);
                  collections.langs.removeItem(subscription);
                }
              }
            }
          }
        }

        if (!Object.observe)
        {
          // Currently only "disabled" property of subscription used for observation
          // but with Advanced tab implementation we should also add more properties.
          ["disabled"].forEach(function(property)
          {
            subscription["$" + property] = subscription[property];
            Object.defineProperty(subscription, property,
            {
              get: function()
              {
                return this["$" + property];
              },
              set: function(value)
              {
                this["$" + property] = value;
                onObjectChanged();
              }
            });
          });
        }
        else
        {
          Object.observe(subscription, onObjectChanged);
        }

        var collection = null;
        if (subscriptionUrl in recommendationsMap)
        {
          var recommendation = recommendationsMap[subscriptionUrl];
          if (recommendation.isPopular)
            collection = collections.popular;
          else if (recommendation.isAdsType && subscription.disabled == false)
            collection = collections.langs;
          else
            collection = collections.allLangs;
        }
        else if (subscriptionUrl == acceptableAdsUrl)
          collection = collections.acceptableAds;
        else
          collection = collections.custom;

        collection.addItems(subscription);
        subscriptionsMap[subscriptionUrl] = subscription;
      });
    }
  }

  function updateFilter(filter)
  {
    var match = filter.text.match(/^@@\|\|([^\/:]+)\^\$document$/);
    if (match && !filtersMap[filter.text])
    {
      filter.title = match[1];
      collections.whitelist.addItems(filter);
    }
    else
      collections.customFilters.addItems(filter);

    filtersMap[filter.text] = filter;
  }

  function loadRecommendations()
  {
    var request = new XMLHttpRequest();
    request.open("GET", "subscriptions.xml", false);
    request.addEventListener("load", function()
    {
      var list = document.getElementById("subscriptionSelector");
      var docElem = request.responseXML.documentElement;
      var elements = docElem.getElementsByTagName("subscription");
      for (var i = 0; i < elements.length; i++)
      {
        var element = elements[i];
        var subscription = Object.create(null);
        subscription.title = element.getAttribute("title");
        subscription.url = element.getAttribute("url");
        subscription.disabled = null;
        subscription.downloadStatus = null;
        subscription.homepage = null;
        subscription.lastSuccess = null;
        var recommendation = Object.create(null);
        recommendation.isAdsType = false;
        recommendation.isPopular = false;
        var prefix = element.getAttribute("prefixes");
        if (prefix)
        {
          var prefix = element.getAttribute("prefixes").replace(/,/g, "_");
          subscription.title = ext.i18n.getMessage("options_language_" + prefix);
          recommendation.isAdsType = true;
        }
        else
        {
          subscription.title = element.getAttribute("specialization");
          recommendation.isPopular = true;
        }

        recommendationsMap[subscription.url] = recommendation;
        updateSubscription(subscription);
      }
    }, false);
    request.send(null);
  }

  function onClick(e)
  {
    var element = e.target;
    while (true)
    {
      if (!element)
        return;

      if (element.hasAttribute("data-action"))
        break;

      element = element.parentElement;
    }

    var actions = element.getAttribute("data-action").split(",");
    for (var i = 0; i < actions.length; i++)
    {
      switch (actions[i])
      {
        case "add-domain-exception":
          addWhitelistedDomain();
          break;
        case "add-predefined-subscription":
          var dialog = E("dialog-content-predefined");
          var title = dialog.querySelector("h3").textContent;
          var url = dialog.querySelector(".url").textContent;
          addEnableSubscription(url, title);
          closeDialog();
          break;
        case "cancel-custom-filters":
          E("custom-filters").classList.remove("mode-edit");
          break;
        case "cancel-domain-exception":
          E("whitelisting-textbox").value = "";
          break;
        case "close-dialog":
          closeDialog();
          break;
        case "edit-custom-filters":
          E("custom-filters").classList.add("mode-edit");
          editCustomFilters();
          break;
        case "import-subscription":
          var url = E("blockingList-textbox").value;
          addEnableSubscription(url);
          closeDialog();
          break;
        case "open-dialog":
          openDialog(element.getAttribute("data-dialog"));
          break;
        case "save-custom-filters":
          ext.backgroundPage.sendMessage(
          {
            type: "filters.importRaw",
            text: E("custom-filters-raw").value
          });
          E("custom-filters").classList.remove("mode-edit");
          break;
        case "switch-tab":
          document.body.setAttribute("data-tab",
            element.getAttribute("data-tab"));
          break;
      }
    }
  }

  function onDOMLoaded()
  {
    var recommendationTemplate = document.querySelector("#recommend-list-table template");
    var popularText = ext.i18n.getMessage("options_popular");
    recommendationTemplate.content.querySelector(".popular").textContent = popularText;
    var languagesTemplate = document.querySelector("#all-lang-table template");
    var buttonText = ext.i18n.getMessage("options_button_add");
    languagesTemplate.content.querySelector(".button-add span").textContent = buttonText;

    populateLists();

    function onFindLanguageKeyUp()
    {
      var searchStyle = E("search-style");
      if (!this.value)
        searchStyle.innerHTML = "";
      else
        searchStyle.innerHTML = "#all-lang-table li:not([data-search*=\"" + this.value.toLowerCase() + "\"]) { display: none; }";
    }

    function getKey(e)
    {
      // e.keyCode has been deprecated so we attempt to use e.key
      if ("key" in e)
        return e.key;
      return getKey.keys[e.keyCode];
    }
    getKey.keys = {
      9: "Tab",
      13: "Enter",
      27: "Escape"
    };

    // Initialize navigation sidebar
    ext.backgroundPage.sendMessage(
    {
      type: "app.get",
      what: "addonVersion"
    },
    function(addonVersion)
    {
      E("abp-version").textContent = addonVersion;
    });
    getDocLink("releases", function(link)
    {
      E("link-version").setAttribute("href", link);
    });

    getDocLink("contribute", function(link)
    {
      document.querySelector("#tab-contribute a").setAttribute("href", link);
    });

    updateShareLink();

    // Initialize interactive UI elements
    document.body.addEventListener("click", onClick, false);
    var placeholderValue  = ext.i18n.getMessage("options_dialog_language_find");
    E("find-language").setAttribute("placeholder", placeholderValue);
    E("find-language").addEventListener("keyup", onFindLanguageKeyUp, false);
    E("whitelisting-textbox").addEventListener("keypress", function(e)
    {
      if (getKey(e) == "Enter")
        addWhitelistedDomain();
    }, false);

    // Advanced tab
    var filterTextbox = document.querySelector("#custom-filters-add input");
    placeholderValue = ext.i18n.getMessage("options_customFilters_textbox_placeholder");
    filterTextbox.setAttribute("placeholder", placeholderValue);
    function addCustomFilters()
    {
      var filterText = filterTextbox.value;
      ext.backgroundPage.sendMessage(
      {
        type: "filters.add",
        text: filterText
      });
      filterTextbox.value = "";
    }
    E("custom-filters-add").addEventListener("submit", function(e)
    {
      e.preventDefault();
      addCustomFilters();
    }, false);
    var customFilterEditButtons = document.querySelectorAll("#custom-filters-edit-wrapper button");

    E("dialog").addEventListener("keydown", function(e)
    {
      switch (getKey(e))
      {
        case "Escape":
          closeDialog();
          break;
        case "Tab":
          if (e.shiftKey)
          {
            if (e.target.classList.contains("focus-first"))
            {
              e.preventDefault();
              this.querySelector(".focus-last").focus();
            }
          }
          else if (e.target.classList.contains("focus-last"))
          {
            e.preventDefault();
            this.querySelector(".focus-first").focus();
          }
          break;
      }
    }, false);
  }

  var focusedBeforeDialog = null;
  function openDialog(name)
  {
    var dialog = E("dialog");
    dialog.setAttribute("aria-hidden", false);
    dialog.setAttribute("aria-labelledby", "dialog-title-" + name);
    document.body.setAttribute("data-dialog", name);

    var defaultFocus = document.querySelector("#dialog-content-" + name
      + " .default-focus");
    if (!defaultFocus)
      defaultFocus = dialog.querySelector(".focus-first");
    focusedBeforeDialog = document.activeElement;
    defaultFocus.focus();
  }

  function closeDialog()
  {
    var dialog = E("dialog");
    dialog.setAttribute("aria-hidden", true);
    dialog.removeAttribute("aria-labelledby");
    document.body.removeAttribute("data-dialog");
    focusedBeforeDialog.focus();
  }

  function populateLists()
  {
    subscriptionsMap = Object.create(null);
    filtersMap = Object.create(null);
    recommendationsMap = Object.create(null);

    // Empty collections and lists
    for (var property in collections)
      collections[property].clearAll();

    ext.backgroundPage.sendMessage(
    {
      type: "subscriptions.get",
      special: true
    },
    function(subscriptions)
    {
      // Load filters
      for (var i = 0; i < subscriptions.length; i++)
      {
        ext.backgroundPage.sendMessage(
        {
          type: "filters.get",
          subscriptionUrl: subscriptions[i].url
        }, 
        function(filters)
        {
          for (var i = 0; i < filters.length; i++)
            updateFilter(filters[i]);
        });
      }
    });
    loadRecommendations();
    getAcceptableAdsURL(function(acceptableAdsUrl)
    {
      var subscription = Object.create(null);
      subscription.url = acceptableAdsUrl;
      subscription.disabled = true;
      subscription.title = ext.i18n.getMessage("options_acceptableAds_description");
      updateSubscription(subscription);

      // Load user subscriptions
      ext.backgroundPage.sendMessage(
      {
        type: "subscriptions.get",
        downloadable: true
      }, 
      function(subscriptions)
      {
        for (var i = 0; i < subscriptions.length; i++)
          onSubscriptionMessage("added", subscriptions[i]);
      });
    });
  }

  function addWhitelistedDomain()
  {
    var domain = E("whitelisting-textbox");
    if (domain.value)
    {
      ext.backgroundPage.sendMessage(
      {
        type: "filters.add",
        text: "@@||" + domain.value.toLowerCase() + "^$document"
      });
    }

    domain.value = "";
  }

  function editCustomFilters()
  {
    var customFilterItems = collections.customFilters.items;
    var filterTexts = [];
    for (var i = 0; i < customFilterItems.length; i++)
      filterTexts.push(customFilterItems[i].text);
    E("custom-filters-raw").value = filterTexts.join("\n");
  }

  function getAcceptableAdsURL(callback)
  {
    ext.backgroundPage.sendMessage(
    {
      type: "prefs.get",
      key: "subscriptions_exceptionsurl"
    },
    function(value)
    {
      getAcceptableAdsURL = function(callback)
      {
        callback(value);
      }
      getAcceptableAdsURL(callback);
    });
  }

  function addEnableSubscription(url, title, homepage)
  {
    var messageType = null;
    var knownSubscription = subscriptionsMap[url];
    if (knownSubscription && knownSubscription.disabled == true)
      messageType = "subscriptions.toggle"
    else
      messageType = "subscriptions.add"

    var message = {
      type: messageType,
      url: url
    };
    if (title)
      message.title = title;
    if (homepage)
      message.homepage = homepage;

    ext.backgroundPage.sendMessage(message);
  }

  function onFilterMessage(action, filter)
  {
    switch (action)
    {
      case "added":
        updateFilter(filter);
        updateShareLink();
        break;
      case "loaded":
        populateLists();
        break;
      case "removed":
        var knownFilter = filtersMap[filter.text];
        collections.whitelist.removeItem(knownFilter);
        collections.customFilters.removeItem(knownFilter);
        delete filtersMap[filter.text];
        updateShareLink();
        break;
    }
  }

  function onSubscriptionMessage(action, subscription)
  {
    switch (action)
    {
      case "added":
      case "disabled":
        updateSubscription(subscription);
        updateShareLink();
        break;
      case "homepage":
        // TODO: NYI
        break;
      case "removed":
        getAcceptableAdsURL(function(acceptableAdsUrl)
        {
          if (subscription.url == acceptableAdsUrl)
          {
            subscription.disabled = true;
            updateSubscription(subscription);
          }
          else
          {
            var knownSubscription = subscriptionsMap[subscription.url];
            if (subscription.url in recommendationsMap)
              knownSubscription.disabled = true;
            else
            {
              collections.custom.removeItem(knownSubscription);
              delete subscriptionsMap[subscription.url];
            }
          }
          updateShareLink();
        });
        break;
      case "title":
        // TODO: NYI
        break;
    }
  }

  function onShareLinkClick(e)
  {
    e.preventDefault();

    getDocLink("share-general", function(link)
    {
      openSharePopup(link);
    });
  }

  function updateShareLink()
  {
    var shareResources = [
      "https://facebook.com/plugins/like.php?",
      "https://platform.twitter.com/widgets/",
      "https://apis.google.com/se/0/_/+1/fastbutton?"
    ];
    var isAnyBlocked = false;
    var checksRemaining = shareResources.length;

    function onResult(isBlocked)
    {
      isAnyBlocked |= isBlocked;
      if (!--checksRemaining)
      {
        // Hide the share tab if a script on the share page would be blocked
        var tab = E("tab-share");
        if (isAnyBlocked)
        {
          tab.hidden = true;
          tab.removeEventListener("click", onShareLinkClick, false);
        }
        else
          tab.addEventListener("click", onShareLinkClick, false);
      }
    }

    for (var i = 0; i < shareResources.length; i++)
      checkShareResource(shareResources[i], onResult);
  }

  ext.onMessage.addListener(function(message)
  {
    switch (message.type)
    {
      case "app.listen":
        if (message.action == "addSubscription")
        {
          var subscription = message.args[0];
          var dialog = E("dialog-content-predefined");
          dialog.querySelector("h3").textContent = subscription.title || "";
          dialog.querySelector(".url").textContent = subscription.url;
          openDialog("predefined");
        }
        else if (message.action == "error")
        {
          alert(message.args.join("\n"));
        }
        break;
      case "filters.listen":
        onFilterMessage(message.action, message.args[0]);
        break;
      case "subscriptions.listen":
        onSubscriptionMessage(message.action, message.args[0]);
        break;
    }
  });

  ext.backgroundPage.sendMessage(
  {
    type: "app.listen",
    filter: ["addSubscription", "error"]
  });
  ext.backgroundPage.sendMessage(
  {
    type: "filters.listen",
    filter: ["added", "loaded", "removed"]
  });
  ext.backgroundPage.sendMessage(
  {
    type: "subscriptions.listen",
    filter: ["added", "disabled", "homepage", "removed", "title"]
  });

  window.addEventListener("DOMContentLoaded", onDOMLoaded, false);
})();
