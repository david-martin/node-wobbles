var httpProxy = require('http-proxy');
var http = require('http');

var options = {
  target: 'http://localhost:8002',
  proxyTimeout: 1000
};
var proxyServer = httpProxy.createProxyServer(options); // See (†)

proxyServer.listen(8001, function() {
  console.log('proxyServer listending on 8001');
});

proxyServer.on('error', function(err) {
  console.log('proxy error', err);
});

var backendServer = http.createServer(function(req, res) {
  setTimeout(function() {
    console.log('sending response');
    res.end('Hello');
  }, 2000)
});

var backendOptions = {
  host: 'localhost',
  path: '/',
  port: 8001,
  method: 'GET'
};

callback = function(response) {
  response.on('error', function() {
    console.log('res error', arguments);
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log('res end', str);
  });
}

backendServer.listen(8002, function() {
  console.log('backendServer listending on 8002');
  var req = http.request(backendOptions, callback);
  req.on('error', function() {
    console.log('req error', arguments);
  });
  req.end();
});
