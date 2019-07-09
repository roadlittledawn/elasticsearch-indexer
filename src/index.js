const fetch = require('node-fetch');
const AWS = require('aws-sdk');

const { log } = console;


var region = 'us-west-2'; // e.g. us-west-1
var domain = 'search-nr-docs-index-bkyrkvszbu2hfn6sez4k2f7yle.us-west-2.es.amazonaws.com'; // e.g. search-domain.region.es.amazonaws.com
var index = 'docs';
var type = 'doc';

async function indexDocument() {

  var endpoint = new AWS.Endpoint(domain);
  var request = new AWS.HttpRequest(endpoint, region);

  var json = await getDocsJSON(3);
  var { docsPages } =  json;

  docsPages.forEach(element => {
    request.method = 'PUT';
    request.path = `/${index}/${type}/${element.docsPage.nodeId}`;
    request.body = JSON.stringify(element.docsPage);
    request.headers['host'] = domain;
    request.headers['Content-Type'] = 'application/json';
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    request.headers["Content-Length"] = request.body.length;

    var credentials = new AWS.EnvironmentCredentials('AWS');
    var signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());

    var client = new AWS.HttpClient();
    client.handleRequest(request, null, function(response) {
      console.log(response.statusCode + ' ' + response.statusMessage);
      var responseBody = '';
      response.on('data', function (chunk) {
        responseBody += chunk;
      });
      response.on('end', function (chunk) {
        console.log('Response body: ' + responseBody);
      });
    }, function(error) {
      console.log('Error: ' + error);
    });
  })
}

async function getDocsJSON(page=1) {
  const res = await fetch(`https://docs-dev.newrelic.com/search-index?page=${page}`, {
    headers: { 
      'Content-Type': 'application/json',
      'X-Phpshield-Key-Disable' : 'SP6ZwOVbe76L_ZcPjaW70g'
   },
  });
  if (!res.ok) throw new Error(`${res.statusCode}: ${res.statusText}`);
  return res.json();
}

indexDocument().catch(e => setImmediate(() => { throw e; }))
