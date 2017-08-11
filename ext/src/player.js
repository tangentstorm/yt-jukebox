/*
 this gets injected as an actual <script> tag onto youtube.com/watch
 by inject.js when the user clicks our extension icon in chrome.

 its job is to take control of the youtube player.

*/
"use strict";

console.log("don't hate the player.js");

let ref = document.getElementById('movie_player');
ref.addEventListener('onStateChange', e=>console.log(['state changed!', e]));
ref.cueVideoById('Y6ljFaKRTrI'); // still alive from portal
ref.playVideo();
