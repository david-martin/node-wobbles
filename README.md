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

## Garbage collection stats

Keep allocating memory, but allow it to be garbage collected.
If `INFLUXDB_HOST` and `INFLUXDB_PORT` are set, various heap space & garbage collection stats will be sent to influxDB.
Sample dashboard in ./grafana_gc_dashboard.json.
This script uses the `gc-stats` node module to gather stats whenever a garbage collection happens. More info on those stats can be found in the readme https://www.npmjs.com/package/gc-stats

```
INFLUXDB_HOST=myinfluxhost INFLUXDB_PORT=8086 node --max_old_space_size=2048 use-memory-but-allow-gc.js
1.1% 91932768 / 8455716864
GC happened TYPE 1 BEFORE 4089400 AFTER 3526800
GC happened TYPE 1 BEFORE 8639312 AFTER 7484704
GC happened TYPE 1 BEFORE 9082184 AFTER 8329072
GC happened TYPE 1 BEFORE 9346744 AFTER 8875352
GC happened TYPE 1 BEFORE 12233144 AFTER 10571688
GC happened TYPE 1 BEFORE 12731912 AFTER 11642408
GC happened TYPE 1 BEFORE 15462728 AFTER 13731400
GC happened TYPE 1 BEFORE 25507896 AFTER 23299640
GC happened TYPE 1 BEFORE 27138904 AFTER 25859096
GC happened TYPE 1 BEFORE 51413536 AFTER 46761568
GC happened TYPE 1 BEFORE 53972992 AFTER 51569056
1.5% 123730528 / 8455716864
GC happened TYPE 1 BEFORE 74609560 AFTER 70247968
GC happened TYPE 1 BEFORE 80854896 AFTER 75975624
GC happened TYPE 1 BEFORE 97727536 AFTER 93739696
GC happened TYPE 1 BEFORE 109231368 AFTER 106385896
GC happened TYPE 1 BEFORE 117206344 AFTER 113599336
GC happened TYPE 1 BEFORE 115450280 AFTER 115450280
GC happened TYPE 1 BEFORE 115745272 AFTER 102115288
GC happened TYPE 1 BEFORE 114214192 AFTER 113659120
GC happened TYPE 1 BEFORE 115644752 AFTER 114982864
GC happened TYPE 1 BEFORE 116754896 AFTER 116164208
2.2% 184388448 / 8455716864
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
 
