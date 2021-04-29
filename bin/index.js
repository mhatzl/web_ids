const redis = require("redis");

const subscriber = redis.createClient();

let seconds = 0;

subscriber.on("message", function(channel, message) {
    messageCount += 1;

    console.log("Message from '" + channel + "': " + message);
});

subscriber.subscribe("nginx_logs_json");

setInterval(() => {
    seconds++;
    console.log("Seconds passed: " + seconds);
}, 1000);