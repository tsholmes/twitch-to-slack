/* global chrome Uint8Array */
'use strict';

var port = chrome.runtime.connect();
var twitchNameInput = null;
var previewDiv = null;
var selectedImg = null;
var emoteNameInput = null;
var uploadButton = null;

var selectedEmote = 0;

var base = 'https://static-cdn.jtvnw.net/emoticons/v1/';

document.addEventListener('DOMContentLoaded', function() {
  twitchNameInput = document.getElementById('twitchNameInput');
  previewDiv = document.getElementById('previewDiv');
  selectedImg = document.getElementById('selectedImg');
  emoteNameInput = document.getElementById('emoteNameInput');
  uploadButton = document.getElementById('uploadButton');
  
  twitchNameInput.addEventListener('input', function() {
    port.postMessage(twitchNameInput.value);
  });
  
  uploadButton.addEventListener('click', function() {
    var url = base + selectedEmote + '/3.0';
    var name = emoteNameInput.value;
    urlToData(url, function(data) {
      var code = '(' + uploadEmote + ')(' + JSON.stringify(data) + ',' + JSON.stringify(name) + ')';
      chrome.tabs.executeScript({code: code});
    });
  });
});

port.onMessage.addListener(function(result) {
  if (previewDiv === null) return;
  previewDiv.innerHTML = '';
  result.forEach(function(element) {
    var div = document.createElement('div');
    var img = document.createElement('img');
    var span = document.createElement('span');
    
    div.appendChild(img);
    div.appendChild(span);
    
    div.className = 'emotePreview';
    img.src = base + element.id + '/1.0';
    span.innerText = element.name;
    
    previewDiv.appendChild(div);
    
    (function(name, id) {
      div.addEventListener('click', function() {
        selectedEmote = id;
        selectedImg.src = base + id + '/1.0';
        emoteNameInput.value = name.toLowerCase();
        uploadButton.disabled = false;
      });
    })(element.name, element.id);
  });
});

function urlToData(url, callback) {
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'blob';
  
  req.addEventListener('load', function() {
    var blob = req.response;
    var reader = new FileReader();
    reader.addEventListener('load', function() {
      var dataUrl = reader.result;
      callback(dataUrl.substring(dataUrl.indexOf(',') + 1));
    });
    reader.readAsDataURL(blob);
  });
  
  req.send();
}

function uploadEmote(data, name) {
  var byteChars = atob(data);
  var byteNums = new Array(byteChars.length);
  for (var i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  var byteArray = new Uint8Array(byteNums);
  var blob = new Blob([byteArray], {type: 'image/png'});
  
  var formData = new FormData();
  formData.append('add', 1);
  formData.append('crumb', document.getElementById('addemoji').children[1].value);
  formData.append('name', name);
  formData.append('mode', 'data');
  formData.append('img', blob, name + '.png');
  
  var req = new XMLHttpRequest();
  req.open('POST', '/customize/emoji', true);
  req.send(formData);
}
