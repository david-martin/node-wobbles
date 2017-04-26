# Node Wobbles

Various scripts & things for reproducing unexpected behaviour in Node.js applications.

## Use all memory until app crashes (Allocation failed - JavaScript heap out of memory)

Allocate 200MB to the GC old space

```
node --max_old_space_size=200 use-all-memory-until-crash.js 
61758592
130669800
195854784
200319616

<--- Last few GCs --->

     680 ms: Mark-sweep 194.2 (233.2) -> 159.4 (199.4) MB, 62.7 / 0.0 ms [allocation failure] [GC in old space requested].
     741 ms: Mark-sweep 159.4 (199.4) -> 159.1 (200.4) MB, 60.2 / 0.0 ms [allocation failure] [GC in old space requested].
     807 ms: Mark-sweep 159.1 (200.4) -> 159.1 (168.4) MB, 66.0 / 0.0 ms [last resort gc].
     871 ms: Mark-sweep 159.1 (168.4) -> 159.0 (168.4) MB, 64.3 / 0.0 ms [last resort gc].


<--- JS stacktrace --->

==== JS stack trace =========================================

Security context: 0x1abf03dcfb39 <JS Object>
    2: _onTimeout(aka alloc) [/home/dmartin/work/node-wobbles/use-all-memory-until-crash.js:~3] [pc=0xcc8c4a7e730] (this=0xd3545d6e0e1 <a Timeout with map 0x3b9be4820be1>)
    3: ontimeout(aka ontimeout) [timers.js:380] [pc=0xcc8c4a73235] (this=0x1abf03d04381 <undefined>,timer=0xd3545d6e0e1 <a Timeout with map 0x3b9be4820be1>)
    4: tryOnTimeout(aka tryOnTimeout) [timers.js:244] [pc=0xcc8c4a72...

FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
 1: node::Abort() [node]
 2: 0x109b7ac [node]
 3: v8::Utils::ReportApiFailure(char const*, char const*) [node]
 4: v8::internal::V8::FatalProcessOutOfMemory(char const*, bool) [node]
 5: v8::internal::Factory::NewUninitializedFixedArray(int) [node]
 6: 0xc496ff [node]
 7: v8::internal::Runtime_GrowArrayElements(int, v8::internal::Object**, v8::internal::Isolate*) [node]
 8: 0xcc8c49079a7
Aborted (core dumped)
```

## Trigger an ECONNRESET (socket hang up)

There is a backend server (on port 8002) and a proxy server (on port 8001). The proxy server will proxy onto the backend server. The proxy server has a timeout of 1 second on any request it proxies to the backend server. The backend server is setup to wait 2 seconds before responding. This always results in a 'socket hang up' ECONNRESET.

```
node econnreset.js

proxyServer listending on 8001
backendServer listending on 8002
proxy error { Error: socket hang up
    at createHangUpError (_http_client.js:253:15)
    at Socket.socketCloseListener (_http_client.js:285:23)
    at emitOne (events.js:101:20)
    at Socket.emit (events.js:188:7)
    at TCP._handle.close [as _onclose] (net.js:501:12) code: 'ECONNRESET' }
sending response

```
 
