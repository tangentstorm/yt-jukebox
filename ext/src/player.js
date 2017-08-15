/*
 this gets injected as an actual <script> tag onto youtube.com/watch
 by inject.js when the user clicks our extension icon in chrome.

 its job is to take control of the youtube player.

*/
"use strict";

let jsCount = 0;
let jsUrls = [  // poor man's promises
  "https://www.gstatic.com/firebasejs/4.2.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/4.2.0/firebase-database.js"];


// load the scripts and wait for them to finish
jsUrls.forEach(url => {
  let el = document.createElement('script');
  el.src = url;
  el.onload = function(){
    if (++jsCount == jsUrls.length) ytkGo();
  };
  document.head.appendChild(el);
});


// --- main routine -------------------------------------------

function ytkGo(){

  // Initialize Firebase
  firebase.initializeApp(fireConfig); // fire-config.js
  console.log("don't hate the player.js");

  let mp = document.getElementById('movie_player');
  mp.addEventListener('onStateChange', e=>console.log(['state changed!', e]));
  mp.cueVideoById('Y6ljFaKRTrI'); // still alive from portal
  mp.playVideo();

  let db = firebase.database();
  db.ref("v").on("value", function(data){
    mp.cueVideoById(data.val());
    mp.playVideo();
  });

}
