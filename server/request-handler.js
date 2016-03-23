// these are for permissions, allowing CORs to go through from sites served on file:// to server on 127.0.0.1:3000
var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

// include node module dependency
var urlParse = require('../node_modules/url');

// storage variables for server data
var results = [];
var objectIdCounter = 1;

// reusable function for various response types
var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

// callback function invoked by basic-server.js
var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  headers['Content-Type'] = 'application/json';

  // use url module to parse the relative path of the request
  var currentPath = urlParse.parse(request.url).pathname;

  // set up whitelist of URLs to accept requests at
  var UrlsAllowed = ['/classes/messages/', '/send', '/classes/room', '/messages', '/log', '/classes/messages'];

  if (UrlsAllowed.indexOf(currentPath) < 0) {
    sendResponse(response, '', 404);
  } else if (request.method === "OPTIONS") {
    sendResponse(response, '');
  } else if (request.method === "GET") {
    sendResponse(response, {results: results});
  } else if (request.method === 'POST') {
    var dataString = '';    
    request.on('data', function(chunk) { // data comes in one chunk at a time
      dataString += chunk; // build up the data string until it is complete
    });
    request.on('end', function(data) { // once data string is complete,
      var message = JSON.parse(dataString); // parse it into a message object
      message.objectId = ++objectIdCounter; // give each message a unique ID
      results.push(message); // add message to storage
      sendResponse(response, {results: results}, 201);
    });
  }

};

// make callback function available to basic-server.js
exports.requestHandler = requestHandler;
