/* global chrome */
'use strict';

var emoteMap = {};
var emoteTree = { list: [] };

var maxSuggest = 8;

function addEmote(name, id) {
  emoteMap[name] = id;
  
  if (emoteTree.list.length < maxSuggest) {
    emoteTree.list.push(name);
  }
  
  var curTree = emoteTree;
  for (var i = 0; i < name.length; i++) {
    var letter = name[i];
    if (!(letter in curTree)) {
      curTree[letter] = { list: [] };
    }
    curTree = curTree[letter];
    if (curTree.list.length < maxSuggest) {
      curTree.list.push(name);
    }
  }
}

function lookupEmotes(prefix) {
  var curTree = emoteTree;
  for (var i = 0; i < prefix.length; i++) {
    var letter = prefix[i];
    if (!(letter in curTree)) {
      return [];
    }
    curTree = curTree[letter];
  }
  var result = [];
  curTree.list.forEach(function (name) {
    result.push({name: name, id: emoteMap[name]});
  });
  return result;
}

function getJSON(url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      callback(JSON.parse(xhttp.responseText));
    }
  };
  xhttp.open('GET', url, true);
  xhttp.send();
}

getJSON('https://twitchemotes.com/api_cache/v2/images.json', function(json) {
  for (var id in json.images) {
    var name = json.images[id].code;
    addEmote(name, id);
  }
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    port.postMessage(lookupEmotes(msg));
  });
});
