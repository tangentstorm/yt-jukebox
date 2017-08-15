/*
 this runs on youtube.com/watch?v=xxxxxx

 code in this file runs in an isolated context, and cannot interact
 with javascript objects in the page's main context.

 however, it *can* inspect and modify the dom, which lets us
 load a script into the main context.

 so... that's what we do.

*/
"use strict";

// this function will be called by event.js if the user clicks
// our icon while on a player page.
function inject_player(){

  ['src/fire-config.js', 'src/player.js'].forEach(url => {
    let s = document.createElement('script');
    s.src = chrome.extension.getURL(url);
    s.onload = function(){ this.remove(); };
    document.head.appendChild(s);
  });

  // oddly, we're not allowed to do this one line from the injected script,
  // because full screen has to be initiated by an actual user action.
  // but code running in *this* context can get around that. :)
  document.querySelector(".ytp-fullscreen-button").click();
}

// this sends a message to our our extension telling it to wake up.
// (when it fires, a listener in event.js will enable the extension icon).
chrome.extension.sendMessage({});
