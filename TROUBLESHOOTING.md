# Troubleshooting & Common Errors

### (runtime) Error: misconfigured csrf

Seen in the web browser client and server output is the following error:

```
Error: misconfigured csrf
    at csrf (~/sources/com.github.iDigBio.idb-portal/node_modules/csurf/index.js:71:19)
    at Layer.handle [as handle_request] (~/sources/com.github.iDigBio.idb-portal/node_modules/express/lib/router/layer.js:95:5)
    [... 39 lines omitted ...]
    at next (~/sources/com.github.iDigBio.idb-portal/node_modules/send/index.js:759:28)
    at ~/sources/com.github.iDigBio.idb-portal/node_modules/send/index.js:767:23
    at FSReqWrap.oncomplete (fs.js:152:21)
```

#### Cause

Server application is unable to connect to Redis.

#### Suggestion

Verify:
- Redis is open to connections from the service
  (could a firewall or network restrictions be preventing connection?)
- If Redis is configured for password-authenticated connections,  
  environment variable `IDB_REDIS_AUTH` is set
