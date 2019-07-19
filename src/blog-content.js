const newRelic = require('newrelic');
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const crawlHistory = require('./crawl-history.js');
const dotenv = require('dotenv');
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


async function getBlogContent(page=1) {
  const res = await fetch(`https://${webPropertyDomain}/wp-json/wp/v2/posts?page=${page}`, {
    headers: { 
      'Content-Type': 'application/json'
   },
  });
  if (!res.ok) throw new Error(`${res.statusCode}: ${res.statusText}`);
  return res.json();
}

function makePlainText(text)
{
  return text.toString()
    .replace(/<[^>]*>?/g, '') // Remove HTML tags around text
    .replace(/(\\r\\n|\\n|\\r|\\t)/g, '') // Remove line break and spacing characters
    .replace(/&#\d{1,4};/g, '') // Remove HTML character entities
    .replace(/[^\w\-\ ]+/g, '') // Remove all non-word chars that are left
}

async function indexPage() {

  var endpoint = new AWS.Endpoint(searchIndexDomain);
  var request = new AWS.HttpRequest(endpoint, region);

  var json = await getBlogContent();

  json.forEach(element => {

    request.method = 'PUT';
    request.path = `/${index}/${type}/${element.id}`;
    // Remove line break, spacing, and HTML tag characters that the Drupal Views display spits out.
    // element.content.rendered = element.content.rendered.replace(/(\r\n|\n|\r|\t|<[^>]*>?|&#\d{1,4};|[^\w\-]+)/gm," ");
    var searchIndexJSON ='';
    var searchIndexJSON = {
      "url": element.link,
      "title" : element.title.rendered,
      "body" : makePlainText(element.content.rendered)
    };
    
    request.body = JSON.stringify(searchIndexJSON);
    // log(`\n${JSON.stringify(request.body)},\n`);
    request.headers['host'] = searchIndexDomain;
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
        crawlHistory.recordCrawl(element.id, element.link, responseJSON.result);
      });
    }, function(error) {
      console.log('Error: ' + error);
    });
  
  
  })
}

indexPage().catch(e => setImmediate(() => { throw e; }))
