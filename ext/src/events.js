/*
  This is our "background page", which listens for various events.
*/
"use strict";


// light up our icon when we're on youtube
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
});


// when the icon is clicked, either take control over the youtube player
// or navigate to the proper page so we can do that on the next click.
chrome.pageAction.onClicked.addListener(function(tab) {
  console.log('in events.js');
   if (tab.url.match(/\/watch?/)) {
     chrome.tabs.executeScript({code: 'inject_player()'}); // inject.js
   } else if (confirm(chrome.i18n.getMessage('l10nGotoPlayer'))) {
     // play a random viral music video from internet history
     let vids = ['9bZkp7q19f0','dQw4w9WgXcQ','-3gKT9r4OIA','9QS0q3mGPGg','CaH_EvlDbK4'];
     chrome.tabs.update({url: "https://www.youtube.com/watch?v=" + vids[Math.floor(vids.length*Math.random())]});
   }
});

