const fetch = require('node-fetch');
const fs = require('fs');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();
const crawlHistory = require('./crawl-history.js');

const { log } = console;

var region = 'us-west-2';
var domain = 'search-nr-docs-index-bkyrkvszbu2hfn6sez4k2f7yle.us-west-2.es.amazonaws.com';
var index = 'docs';
var type = 'doc';


async function getDocsContent(page=0) {
  const res = await fetch(`https://docs-dev.newrelic.com/search-index?page=${page}`, {
    headers: { 
      'Content-Type': 'application/json',
      'X-Phpshield-Key-Disable' : 'SP6ZwOVbe76L_ZcPjaW70g'
   },
  });
  if (!res.ok) throw new Error(`${res.statusCode}: ${res.statusText}`);
  return res.json();
}

async function indexDocument() {

  var endpoint = new AWS.Endpoint(domain);
  var request = new AWS.HttpRequest(endpoint, region);

  var json = await getDocsContent();
  var { docsPages } =  json;

  docsPages.forEach(element => {

    request.method = 'PUT';
    request.path = `/${index}/${type}/${element.docsPage.nodeId}`;
    // Remove line break and spacing characters that the Drupal Views display spits out.
    element.docsPage.body = element.docsPage.body.replace(/(\r\n|\n|\r|\t)/gm,"");
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
        var responseJSON = JSON.parse(responseBody);
        crawlHistory.recordCrawl(element.docsPage.nodeId, element.docsPage.url, responseJSON.result);
      });
    }, function(error) {
      console.log('Error: ' + error);
    });
  
  
  })
}

indexDocument().catch(e => setImmediate(() => { throw e; }))
