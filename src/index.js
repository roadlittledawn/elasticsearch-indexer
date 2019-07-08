const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const { log } = console;

/*
Workflow
1. Hit custom JSON endpoint.
2. Send each page record to experimental elasticsearch endpoint with fields per spec.

*/


const domain = 'https://docs.newrelic.com';



const addToSearchIndex =  (json) => {
  const { docsPages } =  json;
  docsPages.forEach(element => {
    element.docsPage.body = element.docsPage.body.replace(/(\r\n|\n|\r|\t)/gm,"");
    const searchIndexPutEndpoint = 'https://search-nr-docs-index-bkyrkvszbu2hfn6sez4k2f7yle.us-west-2.es.amazonaws.com/docs/doc/'+element.docsPage.nodeId;
    const resp = fetch(searchIndexPutEndpoint, {
      method: 'put',
      body:    JSON.stringify(element.docsPage),
      headers: { 
        'Content-Type': 'application/json',
        'X-Phpshield-Key-Disable' : 'SP6ZwOVbe76L_ZcPjaW70g'
     },
    }).then(res => res.json()).then(json => log(json));
    // log(element.docsPage.body);
  });
};


const performIndex = async () => {
  const res = await fetch('https://docs-dev.newrelic.com/search-index', {
    headers: { 
      'Content-Type': 'application/json',
      'X-Phpshield-Key-Disable' : 'SP6ZwOVbe76L_ZcPjaW70g'
   },
  }).then(res => res.json())
  .then(json => addToSearchIndex(json));

};



// Run this bad boy!
performIndex().catch(e => setImmediate(() => { throw e; }));
// run2().catch(e => setImmediate(() => { throw e; }));
