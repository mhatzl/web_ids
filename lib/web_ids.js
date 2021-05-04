const redis = require('redis');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');

/**
 * Creates client and connects to the redis with default port settings
 * Loads all json files containing signatures for pattern matching and detection
 * and * attaches an event listener to redis client to analyze new requests
 * */
function init() {
  const subscriber = redis.createClient();

  const seconds = 0;
  const messageCount = 0;

  subscriber.on('message', function(channel, message) {
    messageCount += 1;

    const formatted_message = JSON.parse(message);

    console.log('\n');
    console.log(`Request #${messageCount}:`);
    console.log(formatted_message);

    performChecks(message);
  });

  subscriber.subscribe('nginx_logs_json');
}

function loadSignatures(dirname) {
}

function performChecks(message) {
  if (!message) return;

  checkIp(message.srcip);
  checkRequestBody(message.request_uri);
  checkRequestUri(message.body);
}

function checkIp(srcIp) {
  // TODO
  // file with signatures should be read and ip's stored
  // match them here
}

function checkRequestBody(requestBody) {
  // TODO
  // file with signatures should be read and request uri's stored
  // match them here
}
function checkRequestUri(requestUri) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

exports.startDetection = () => {
  init();
}
;
