const redis = require('redis');
const fs = require('fs');
const path = require('path');

// global vars that store signatures
let IP_SIGNATURES = [];
let HEADER_SIGNATURES = [];
let BODY_SIGNATURES = [];
let STATUS_SIGNATURES = [];

/**
 * Creates client and connects to the redis with default port settings
 * Loads all json files containing signatures for pattern matching and detection
 * and * attaches an event listener to redis client to analyze new requests
 * */
function init() {
  // const subscriber = redis.createClient();

  const seconds = 0;
  const messageCount = 0;
  loadSignatures(path.join(__dirname, '..', 'signatures'));

  // local testing
  // subscriber.on('message', (_channel, message) => {
  //   messageCount += 1;

  //   const formattedMessage = JSON.parse(message);

  //   console.log('\n');
  //   console.log(`Request #${messageCount}:`);
  //   console.log(formattedMessage);

  //   performChecks(message);
  // });

  // subscriber.subscribe('nginx_logs_json');
}

/**
 * Loads all signatures from given directory into global variables
 * @param {*} dirname path to directory
 */
function loadSignatures(dirname) {
  fs.readdirSync(dirname).forEach((filename) => {
    content = JSON.parse(fs.readFileSync(dirname + '/' +filename));

    console.log(content);

    IP_SIGNATURES = [...content.ipSignature, ...IP_SIGNATURES];
    HEADER_SIGNATURES = [...content.headerSignature, ...HEADER_SIGNATURES];
    BODY_SIGNATURES = [...content.bodySignature, ...BODY_SIGNATURES];
    STATUS_SIGNATURES = [...content.statusSignature, ...STATUS_SIGNATURES];
  });

  console.log('\nLoaded: ');
  console.log(`${IP_SIGNATURES.length} ip signatures,`);
  console.log(`${HEADER_SIGNATURES.length} header signatures,`);
  console.log(`${BODY_SIGNATURES.length} body signatures and`);
  console.log(`${STATUS_SIGNATURES.length} status signatures,`);
}

/**
 * Checks the request message for malicious access
 * @param {Object} message in JSON format to be checked
 * */
function performChecks(message) {
  if (!message) return;

  checkIp(message.srcip);
  checkRequestBody(message.request_uri);
  checkRequestUri(message.body);
}

/**
 * Check if ip address corresponds to one of the ips in signature database
 * @param {string} srcIp ip address in the request message
 * */
function checkIp(srcIp) {
  // TODO
  // file with signatures should be read and ip's stored
  // match them here
}

/**
 * Check if request body contains offending data
 * @param {Object} requestBody JSON containing request body data
 * */
function checkRequestBody(requestBody) {
  // TODO
  // file with signatures should be read and request uri's stored
  // match them here
}

/**
 * Check if request header contains offending data
 * @param {Object} requestHeader JSON containing request body data
 * */
function checkRequestHeader(requestHeader) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

/**
 * Check if request status contains offending data
 * @param {Object} requestStatus JSON containing request body data
 * */
function checkRequestHeader(requestStatus) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

exports.startDetection = () => {
  init();
};
