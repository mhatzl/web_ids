const redis = require("redis");

const subscriber = redis.createClient();

let seconds = 0;
let messageCount = 0;

subscriber.on("message", function(channel, message) {
    messageCount += 1;

    console.log("Message from '" + channel + "': " + message);

    const formatted = JSON.parse(message);

    console.log("\n\n");
    console.log("Parsed message: \n");
    console.log(formatted);
});

subscriber.subscribe("nginx_logs_json");

setInterval(() => {
    seconds++;
    console.log("Seconds passed: " + seconds);
}, 1000);