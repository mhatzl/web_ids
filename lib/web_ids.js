// read environment variables from .env file
require('dotenv').config();

const redis = require('redis');
const fs = require('fs');
const path = require('path');


// global vars that store signatures
let IP_SIGNATURES = [];
let REQUEST_SIGNATURES = [];

/**
 * Creates client and connects to the redis with default port settings
 * Loads all json files containing signatures for pattern matching and detection
 * and * attaches an event listener to redis client to analyze new requests
 * */
function init() {
  loadSignatures(path.join(__dirname, '..', 'signatures'));

  if (process.env.DEV_ENV !== 'development') {
    const subscriber = redis.createClient();

    subscriber.on('message', (_channel, message) => {
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

      if (Array.isArray(content.requestSignature)) {
        REQUEST_SIGNATURES =
        [...content.requestSignature,
          ...REQUEST_SIGNATURES];
      }
    }
  });

  if (process.env.DEV_ENV === 'development') {
    console.log('Loaded: ');
    console.log(`${IP_SIGNATURES.length} ip signatures and`);
    console.log(`${REQUEST_SIGNATURES.length} request signatures,`);
  }
}

/**
 * Checks the request message for malicious access
 * @param {Object} message in JSON format to be checked
 * */
function performChecks(message) {
  if (!message) return;

  checkIp(message.srcip);
  checkRequest(message.request_body);
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
 * @param {Object} request JSON containing request data
 * Request can have following options: request_method, request_uri,
 * status and body
 * */
function checkRequest(request) {
  // TODO
  // file with signatures should be read and request uri's stored
  // match them here

  const method = request.request_method;
  const uri = request.request_uri;
  const status = request.status;
  const body = request.body;

  const signatureMatch = false;

  REQUEST_SIGNATURES.forEach((signature) => {
    const hasMatch = false;

    if (signature.method) {
      hasMatch = method.match(signature.method);
    }

    if (signature.uri) {
      hasMatch = uri.match(signature.ur) && hasMatch;
    }

    if (signature.status) {
      hasMatch = status.match(signature.status) && hasMatch;
    }

    if (signature.body) {
      hasMatch = body.match(signature.body) && hasMatch;
    }

    signatureMatch = hasMatch || signatureMatch;
  });

  if (signatureMatch) {
    const filePath = path.join(__dirname, '..', 'logs', 'web_ids.log');
    const type = 'Warning - potential intrusion';
    const message = method + ' request from ip ' + request.srcip +
                  ' tried to access ' + uri + ' and received status ' +
                   status + ' and matched against provided signatures.';

    appendToLog(filePath, type, message);
  }
}

/**
 * Append message with designated type to logfile
 * @param {String} filePath path to logfile
 * @param {String} type of message ( e.g. Warning like 'Intrusion detected' )
 * @param {String} message that will be written to the file
 * */
function appendToLog(filePath, type, message) {
  const currDateTime = new Date().toUTCString();

  const logMessage = '[' + currDateTime + '] [' + type + ']' + ': '+ message;
  fs.appendFile(filepath, logMessage);
}
exports.startDetection = () => {
  init();
};
