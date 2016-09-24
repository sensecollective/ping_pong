'use strict';

const context = new AudioContext();

// create audio buffers
let pingBuffer = null;
let pongBuffer = null;
let postPingBuffer = null;
let postPongBuffer = null;
let failBuffer = null;

// create and chain audio nodes
let leftPanner = context.createStereoPanner();
let rightPanner = context.createStereoPanner();
leftPanner.pan.value = -1;
rightPanner.pan.value = 1;
leftPanner.connect(context.destination);
rightPanner.connect(context.destination);

// load sounds
loadSound('audio/pop.mp3', (buf) => { pingBuffer = buf });
loadSound('audio/pop2.mp3', (buf) => { pongBuffer = buf });
loadSound('audio/post1.mp3', (buf) => { postPingBuffer = buf });
loadSound('audio/post2.mp3', (buf) => { postPongBuffer = buf });
loadSound('audio/gnatattack_bombhit.mp3', (buf) => { failBuffer = buf });


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

chrome.webRequest.onBeforeSendHeaders.addListener(details => {
  if (details.method === 'POST' && postPingBuffer)
    playSound(postPingBuffer, 1, leftPanner);
  else if (pingBuffer) playSound(pingBuffer, 2, leftPanner);
},  {urls: ['<all_urls>']});

chrome.webRequest.onHeadersReceived.addListener(details => {
  console.log(details.statusCode);
}, {urls: ['<all_urls>']});

chrome.webRequest.onCompleted.addListener(details => {
  if (details.statusCode >= 400) {
    playSound(failBuffer, 1, context.destination);
  }
  else if (details.method === 'POST' && postPongBuffer)
    playSound(postPongBuffer, 1, rightPanner);
  else if (pongBuffer) playSound(pongBuffer, 0.3, rightPanner);
}, {urls: ['<all_urls>']});

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

function playSound(buffer, rate, panner) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(panner);       // connect the source to the context's destination (the speakers)
  source.playbackRate.setValueAtTime(rate, 0);
  source.start(0);                           // play the source now
}

function onError(err) {
  console.log('error loading sound', err);
}