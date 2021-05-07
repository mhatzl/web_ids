# Overview
web_ids uses logs from a webserver and checks http requests sent to this server, if they might be malicious or not.
This check is done using signatures of possible malicious requests.

## Fetching Logs
See [FetchingLogs](FetchingLogs.md) on how to setup the logging chain, so that web_ids can read the http requests a webserver received.

## Signature Syntax
See [signatures.json](/signatures/signatures.json) for the signature syntax.

