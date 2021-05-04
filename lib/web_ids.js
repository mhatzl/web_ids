// read environment variables from .env file
require('dotenv').config();

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
  const seconds = 0;
  const messageCount = 0;
  loadSignatures(path.join(__dirname, '..', 'signatures'));

  if (process.env.DEV_ENV && process.env.DEV_ENV !== 'development') {
    const subscriber = redis.createClient();

    subscriber.on('message', (_channel, message) => {
      messageCount += 1;

      const formattedMessage = JSON.parse(message);

      performChecks(formattedMessage);
    });

    subscriber.subscribe('web_ids_requests');
  }
}

/**
 * Loads all signatures from given directory into global variables
 * @param {*} dirname path to directory
 */
function loadSignatures(dirname) {
  fs.readdirSync(dirname).forEach((filename) => {
    const filePath = dirname + '/' + filename;
    let content = null;

    if (path.extname(filename).toLowerCase() === '.json') {
      try {
        content = JSON.parse(fs.readFileSync(filePath));
      } catch (syntaxError) {
        console.error('\n' + filePath +
        ' is not a valid JSON. Skipping file.\n');
      }
    } else if (process.env.DEV_ENV && process.env.DEV_ENV === 'development') {
      console.log('\n' + filePath +
        ' is not a valid JSON. Skipping file.\n');
    }

    if (content) {
      if (Array.isArray(content.ipSignature)) {
        IP_SIGNATURES = [...content.ipSignature, ...IP_SIGNATURES];
      }

      if (Array.isArray(content.uriSignature)) {
        HEADER_SIGNATURES = [...content.uriSignature, ...HEADER_SIGNATURES];
      }

      if (Array.isArray(content.bodySignature)) {
        BODY_SIGNATURES = [...content.bodySignature, ...BODY_SIGNATURES];
      }

      if (Array.isArray(content.statusSignature)) {
        STATUS_SIGNATURES = [...content.statusSignature, ...STATUS_SIGNATURES];
      }
    }
  });

  if (process.env.DEV_ENV && process.env.DEV_ENV === 'development') {
    console.log('Loaded: ');
    console.log(`${IP_SIGNATURES.length} ip signatures,`);
    console.log(`${HEADER_SIGNATURES.length} header signatures,`);
    console.log(`${BODY_SIGNATURES.length} body signatures and`);
    console.log(`${STATUS_SIGNATURES.length} status signatures,`);
  }
}

/**
 * Checks the request message for malicious access
 * @param {Object} message in JSON format to be checked
 * */
function performChecks(message) {
  if (!message) return;

  checkIp(message.srcip);
  checkRequestBody(message.request_body);
  checkRequestUri(message.request_uri);
  checkRequestStatus(message.status);
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
 * Check if request uri contains offending data
 * @param {String} requestUri with the uri to be accessed
 * */
function checkRequestUri(requestUri) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

/**
 * Check if request status contains offending data
 * @param {String} requestStatus string containing request status returned
 * */
function checkRequestStatus(requestStatus) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}
/**
 * Append message with designated type to logfile
 * @param {String} path to logfile
 * @param {String} type of message ( e.g. Intrusion detected )
 * @param {String} message that will be written to the file
 * */
function appendToLog(filePath, type, message){
 let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

let currDateTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds; 
var logMessage = '[' + currDateTime + '] [' + type + ']' + ': '+ message;
fs.appendFile(filepath, logMessage);  
}
exports.startDetection = () => {
  init();
};
