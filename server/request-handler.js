var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

var urlParse = require('../node_modules/url');
var results = [];
var objectIdCounter = 1;

var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  headers['Content-Type'] = 'application/json';

  var currentPath = urlParse.parse(request.url).pathname;

  var UrlsAllowed = ['/classes/messages/', '/send', '/classes/room', '/messages', '/log', '/classes/messages'];

  if (UrlsAllowed.indexOf(currentPath) < 0) {
    sendResponse(response, '', 404);
  } else if (request.method === "OPTIONS") {
    sendResponse(response, '');
  } else if (request.method === "GET") {
    sendResponse(response, {results: results});
  } else if (request.method === 'POST') {
    var dataString = '';    
    request.on('data', function(chunk) {
      dataString += chunk;
    });
    request.on('end', function(data) {
      var message = JSON.parse(dataString);
      message.objectId = ++objectIdCounter;
      results.push(message);
      sendResponse(response, {results: results}, 201);
    });
  }

};

exports.requestHandler = requestHandler;
