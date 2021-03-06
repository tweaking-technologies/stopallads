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

(function(global)
{
  if (!global.ext)
    global.ext = {};

  var backgroundFrame = document.createElement("iframe");
  backgroundFrame.setAttribute("src", "background.html" + window.location.search);
  backgroundFrame.style.display = "none";
  window.addEventListener("DOMContentLoaded", function()
  {
    document.body.appendChild(backgroundFrame);
  }, false);

  var messageQueue = [];
  var maxMessageId = -1;
  var loadHandler = function(event)
  {
    if (event.data.type == "backgroundPageLoaded")
    {
      var queue = messageQueue;
      messageQueue = null;
      if (queue)
        for (var i = 0; i < queue.length; i++)
          backgroundFrame.contentWindow.postMessage(queue[i], "*");
      window.removeEventListener("message", loadHandler, false);
    }
  }
  window.addEventListener("message", loadHandler, false);

  global.ext.backgroundPage = {
    _sendRawMessage: function(message)
    {
      if (messageQueue)
        messageQueue.push(message);
      else
        backgroundFrame.contentWindow.postMessage(message, "*");
    },
    sendMessage: function(message, responseCallback)
    {
      var messageId = ++maxMessageId;

      this._sendRawMessage({
        type: "message",
        messageId: messageId,
        payload: message
      });

      if (responseCallback)
      {
        var callbackWrapper = function(event)
        {
          if (event.data.type == "response" && event.data.messageId == messageId)
          {
            window.removeEventListener("message", callbackWrapper, false);
            responseCallback(event.data.payload);
          }
        };
        window.addEventListener("message", callbackWrapper, false);
      }
    }
  };
})(this);
