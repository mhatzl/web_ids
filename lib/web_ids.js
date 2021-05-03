const redis = require("redis");

/**
 * Initializes the web_ids
 * */
function init() {
  const subscriber = redis.createClient();

  let seconds = 0;
  let messageCount = 0;

  subscriber.on("message", function(channel, message) {
    messageCount += 1;

    const formatted_message = JSON.parse(message);

    console.log("\n");
    console.log(`Request #${messageCount}:`);
    console.log(formatted_message);

    perform_checks(message);
  });

  subscriber.subscribe("nginx_logs_json");
}

function perform_checks(message) {
  if (!message) return;

  check_ip(message.srcip);
  check_request_uri(message.request_uri);
  check_request_body(message.request_uri);
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
function check_request_uri(request_body) {
  // TODO
  // file with signatures should be read and request bodies stored
  // match them here
}

exports.start_ids = () => {
  init();
}