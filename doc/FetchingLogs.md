# Fetching Logs
web_ids works with a fixed JSON-format that gets passed in via Redis.

The fixed JSON-format looks as follows:

~~~
{
	"timestamp" : "<Monthname> <Day> <HH:MM:SS>",
	"service" : "<nginx, apache, ...>",
	"srcip" : "<source ip-address>",
	"method" : "<request method>",
	"uri" : "<requested uri>",
	"status" : "<request status>",
	"body" : "<request body>"
}
~~~

# Example Logchain
In this example, nginx and rsyslog are used on an Ubuntu 20.04 server to send the needed request informations to Redis, where web_ids subscribed to channel `web_ids_requests`.
It is assumed, that `nginx`, `rsyslog` and `Redis` are already installed.

## Configuring nginx logs
To get the needed informations, a custom log_format can be created. This log_format must be specified outside a server-block, otherwise nginx will throw errors when checking the configuration.

Here is a possible log_format:

~~~
log_format web_ids '$remote_addr : "$request_method" : "$request_uri" : $status : "$request_body"';
~~~

Inside a server- or location-block, this log_format can now be used to send access logs to syslog.

Here is an example using the default syslog socket on unix and the default facility (*local7*) nginx uses. For more options, see [Logging to syslog](http://nginx.org/en/docs/syslog.html).

~~~
access_log syslog:server=unix:/dev/log,nohostname web_ids;	
~~~

## Configuring rsyslog
rsyslog is used by default in Ubuntu 20.04 to manage syslogs. rsyslog also provides an output module to forward logs to Redis (see [rsyslog omhiredis](https://www.rsyslog.com/doc/v8-stable/configuration/modules/omhiredis.html)). With this module, it is also possible to reformat received logs into the needed JSON-format shown above.

Here is an example of a rsyslog configuration to create the needed JSON-format and send to the Redis-channel:

~~~
# load module omhiredis
module(load="omhiredis")

# template to log to web_ids
template(name="web_ids_json" type="list" ){
  constant(value="{")
  property(name="timereported" outname="timestamp" format="jsonf")
  constant(value=",")
  property(name="syslogtag" outname="service" format="jsonf")
  constant(value=",")
  property(name="msg" outname="srcip" format="jsonf"
    regex.type="ERE"
    regex.expression="([[:digit:].]+) : \"[[:alpha:]]+\" : \".*\" : [[:digit:]]+ : \".*\""
    regex.submatch="1"
  )
  constant(value=",")
  property(name="msg" outname="method" format="jsonf"
    regex.type="ERE"
    regex.expression="[[:digit:].]+ : \"([[:alpha:]]+)\" : \".*\" : [[:digit:]]+ : \".*\""
    regex.submatch="1"
  )
  constant(value=",")
  property(name="msg" outname="uri" format="jsonf"
    regex.type="ERE"
    regex.expression="[[:digit:].]+ : \"[[:alpha:]]+\" : \"(.*)\" : [[:digit:]]+ : \".*\""
    regex.submatch="1"
  )
  constant(value=",")
  property(name="msg" outname="status" format="jsonf"
    regex.type="ERE"
    regex.expression="[[:digit:].]+ : \"[[:alpha:]]+\" : \".*\" : ([[:digit:]]+) : \".*\""
    regex.submatch="1"
  )
  constant(value=",")
  property(name="msg" outname="body" format="jsonf"
    regex.type="ERE"
    regex.expression="[[:digit:].]+ : \"[[:alpha:]]+\" : \".*\" : [[:digit:]]+ : \"(.*)\""
    regex.submatch="1"
  )
  constant(value="}")
}

# Only forward logs sent to facility local7
# 23 == local7 see RFC 3164 https://tools.ietf.org/html/rfc3164#section-4.1.1
# key is the name of the Redis-channel
if ($syslogfacility == 23) then action(
  name="publish_redis"
  server="127.0.0.1"
  serverport="6379"
  type="omhiredis"
  mode="publish"
  key="web_ids_requests"
  template="web_ids_json"
)
~~~

# Check the logchain
After changing the configurations and restarting the services, new requests sent to the webserver will be shown in the defined Redis-channel.
Redis provides a commandline tool called `redis-cli`.

Just run `redis-cli` in a console, to get access to the local Redis-server. Now subscribe to the channel defined in the rsyslog configuration using

~~~
subscribe <your-channel-name>
~~~

After that, you should see new requests sent to the webserver.

