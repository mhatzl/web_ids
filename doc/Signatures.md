# Signatures

web_ids allows addition of multiple signature files. To add one you have to put it into the `signatures` folder. The signatures have to be provided within the following skeleton of a JSON file:

```json
{
    "ipSignature": [
        <your ips here>
    ],
    "requestSignature": [
        <your request signatures here>
    ]
}
```

**Important:**

- New signatures are not loaded unless web_ids is rebooted!
- Characters need to be escaped properly.
- If you do not plan to add one kind of signature, leave the array empty

## IP Signatures

`ipSignature` is an array of Regex strings that represent certain IPs or IP ranges. For example, an entry might look like this:

```json
^123\\.456\\.789\\.012$
```

## Request Signatures

`requestSignature` is an array of objects. Each object has to contain at least one of the following keys: `method`, `status`, `uri` or `body`. The value of a key has to be provided as a Regex string. For a signature to match a request, all the keys of a signature must match the corresponding fields in the request. For example, an entry might look like this:

```json
{
  "method": "^GET$",
  "uri": "/example\\.txt"
}
```
