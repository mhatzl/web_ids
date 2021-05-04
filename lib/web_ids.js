const redis = require("redis");
const fs = require("fs");

// global vars that store signatures
ipSignature = [];
headerSignature = [];
bodySignature = [];
statusSignature = [];

/**
 * Initializes the web_ids
 * */
function init() {
  const subscriber = redis.createClient();

  let seconds = 0;
  let messageCount = 0;
  loadSignatures("../signatures/");

  subscriber.on("message", function (channel, message) {
    messageCount += 1;

    const formatted_message = JSON.parse(message);

    console.log("\n");
    console.log(`Request #${messageCount}:`);
    console.log(formatted_message);

    perform_checks(message);
  });

  subscriber.subscribe("web_ids_requests");
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

  check_ip(message.srcip);
  check_request_uri(message.request_uri);
  check_request_body(message.body);
}

function check_ip(src_ip) {
  // TODO
  // file with signatures should be read and ip's stored
  // match them here
}

function check_request_uri(request_uri) {
  // TODO
  // file with signatures should be read and request uri's stored
  // match them here
}
function check_request_body(request_body) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

exports.start_ids = () => {
  init();
};
