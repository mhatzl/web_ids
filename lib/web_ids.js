<<<<<<< HEAD
const redis = require('redis');
const fs = require('fs');
const {promisify} = require('util');
const path = require('path');
=======
const redis = require("redis");
const fs = require("fs");

// global vars that store signatures
ipSignature = [];
headerSignature = [];
bodySignature = [];
statusSignature = [];

/**
 * Creates client and connects to the redis with default port settings
 * Loads all json files containing signatures for pattern matching and detection
 * and * attaches an event listener to redis client to analyze new requests
 * */
function init() {
  const subscriber = redis.createClient();

  let seconds = 0;
  let messageCount = 0;
  loadSignatures("../signatures/");

  subscriber.on("message", function (channel, message) {
    messageCount += 1;

    const formatted_message = JSON.parse(message);

    console.log('\n');
    console.log(`Request #${messageCount}:`);
    console.log(formatted_message);

    performChecks(message);
  });

  subscriber.subscribe('nginx_logs_json');
}

/**
 * Loads all signatures from given directory into global variables
 * @param {*} dirname path to directory
 */
function loadSignatures(dirname) {
  fs.readdirSync(dirname).forEach((filename) => {
    content = JSON.parse(fs.readFileSync(dirname + filename));
    content["ipSignature"].forEach((x) => ipSignature.push(x));
    content["headerSignature"].forEach((x) => headerSignature.push(x));
    content["bodySignature"].forEach((x) => bodySignature.push(x));
    content["statusSignature"].forEach((x) => statusSignature.push(x));
  });
}

function perform_checks(message) {
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
};
