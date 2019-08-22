require('newrelic');
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const crawlHistory = require('./crawl-history.js');
const utils = require('./utilities/utilities.js');

dotenv.config();

const { log } = console;

/*
Crawl method: REST API / JSON endpoint
API docs: https://developer.wordpress.org/rest-api/reference/posts
Source Software: Wordpress
*/

const webPropertyDomain = 'blog.newrelic.com';

var region = 'us-west-2';
var searchIndexDomain = 'search-nr-docs-index-bkyrkvszbu2hfn6sez4k2f7yle.us-west-2.es.amazonaws.com';
var index = 'blog';
var type = 'post';


async function getBlogContent(page = 3) {
  const res = await fetch(`https://${webPropertyDomain}/wp-json/wp/v2/posts?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`${res.statusCode}: ${res.statusText}`);
  return res.json();
}

async function indexPage() {
  const endpoint = new AWS.Endpoint(searchIndexDomain);
  const request = new AWS.HttpRequest(endpoint, region);

  const json = await getBlogContent();

  json.forEach(element => {
    request.method = 'PUT';
    request.path = `/${index}/${type}/${element.id}`;
    // Remove line break, spacing, and HTML tag characters that the Drupal Views display spits out.
    // element.content.rendered = makePlainText(element.content.rendered);
    // log(utils.makePlainText(element.content.rendered));
    var searchIndexJSON = {
      "url": element.link,
      "title" : element.title.rendered,
      "body" : utils.makePlainText(element.content.rendered)
    };

    
    request.body = JSON.stringify(searchIndexJSON);
    request.headers['host'] = searchIndexDomain;
    request.headers['Content-Type'] = 'application/json';
    // Content-Length is only needed for DELETE requests that include a request
    // body, but including it for all requests doesn't seem to hurt anything.
    // request.headers["Content-Length"] = request.body.length;

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
        crawlHistory.recordCrawl(element.id, element.link, responseJSON.result);
      });
    }, function(error) {
      console.log('Error: ' + error);
    });
  
  
  })
}

indexPage().catch(e => setImmediate(() => { throw e; }))
