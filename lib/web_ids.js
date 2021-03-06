// read environment variables from .env file
const redis = require('redis');
const fs = require('fs');
const path = require('path');
const {test, dev, channel} = require('./handle_flags');

// global vars that store signatures
let IP_SIGNATURES = [];
let REQUEST_SIGNATURES = [];
let LOG_FILE = '';

// Log types:
const LOG_TYPE = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  FATAL: 'FATAL',
};

/**
 * Creates client and connects to the redis with default port settings
 * Loads all json files containing signatures for pattern matching and detection
 * and * attaches an event listener to redis client to analyze new requests
 * */
function init() {
  loadSignatures(path.join(__dirname, '..', 'signatures'));
  LOG_FILE = path.join(__dirname, '..', 'logs', 'web_ids.log');

  if (!dev) {
    const subscriber = redis.createClient();

    subscriber.on('message', (_channel, message) => {
      const formattedMessage = JSON.parse(message);

      if (test) {
        console.log(formattedMessage);
      }

      performChecks(formattedMessage);
    });

    subscriber.subscribe(channel);
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

  if (dev) {
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
  checkRequest(message);
}

/**
 * Check if ip address corresponds to one of the ips in signature database
 * @param {string} srcIp ip address in the request message
 * */
function checkIp(srcIp) {
  // TODO
  // file with signatures should be read and ip's stored
  // match them here

  for (const {ip} of IP_SIGNATURES) {
    if (srcIp.match(ip)) {
      const type = LOG_TYPE.WARNING;
      const message = 'Known malicious ip: ' + srcIp + ' detected.';

      appendToLog(LOG_FILE, type, message);
      break;
    }
  }
}

/**
 * Check if request contains offending data
 * @param {Object} request JSON containing request data.
 * A request can have the following options: method, uri, status and body
 * */
function checkRequest(request) {
  const method = request.method;
  const uri = request.uri;
  const status = request.status;
  const body = request.body;

  let type = '';

  for (const signature of REQUEST_SIGNATURES) {
    let hasMatch = true;

    if (signature.method) {
      hasMatch = method.match(signature.method) && hasMatch;
    }

    if (signature.uri) {
      hasMatch = uri.match(signature.uri) && hasMatch;
    }

    if (signature.status) {
      hasMatch = status.match(signature.status) && hasMatch;
    }

    if (signature.body) {
      hasMatch = body.match(signature.body) && hasMatch;
    }

    if (hasMatch) {
      if (signature.type) {
        type = LOG_TYPE[signature.type.toUpperCase()];
      } else {
        type = LOG_TYPE.INFO;
      }

      const message = method + ' from ip ' + request.srcip +
                      ' on "' + uri + '" with status ' +
                      status + ' matched against the following signature: ' +
                      JSON.stringify(signature);

      appendToLog(LOG_FILE, type, message);

      break;
    }
  }
}

/**
 * Append message with designated type to logfile
 * @param {String} filePath path to logfile
 * @param {String} type of message ( DEBUG, INFO, WARNING or FATAL )
 * @param {String} message that will be written to the file
 * */
function appendToLog(filePath, type, message) {
  const currDateTime = new Date().toUTCString();

  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  const logMessage = '[' + currDateTime + '] [' + type + ']' + ': '+
                     message + '\n';
  fs.appendFile(filePath, logMessage, () => {
    if (test || dev) {
      console.log('Match detected and message written to log.');
    }
  });
}
exports.startDetection = () => {
  init();
};
