'use strict';

const context = new AudioContext();
let pingBuffer = null;
let pongBuffer = null;

loadSound('images/pop.mp3', (buf) => {
	pingBuffer = buf;
});

loadSound('images/pop2.mp3', (buf) => {
	pongBuffer = buf;
});


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

chrome.webRequest.onBeforeSendHeaders.addListener(details => {
  // console.log('request');
  if (pingBuffer) playSound(pingBuffer, 2);
},  {urls: ['<all_urls>']});

chrome.webRequest.onCompleted.addListener(details => {
  if (pongBuffer) playSound(pongBuffer, 1);
	// console.log('response');
}, {urls: ['<all_urls>']});

console.log('\'Allo \'Allo! Event Page for Page Action');



function loadSound(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, callback, onError);
  }
  request.send();
}

function playSound(buffer, rate) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.playbackRate.setValueAtTime(rate, 0);
  source.start(0);                           // play the source now
                                             // note: on older systems, may have to use deprecated noteOn(time);
}

function onError(err) {
	console.log('error loading sound', err);
}