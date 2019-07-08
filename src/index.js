const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const { log } = console;

//Regex pattern for match integrations node links
// \/docs\/integrations\/.*\/.*\/.*
const domain = 'https://docs.newrelic.com';

const run = async () => {
  const res = await fetch('https://docs.newrelic.com/docs/integrations?toc=true');
  const body = await res.text();
  const $ = cheerio.load(body);

  // Let's echo out the title tag.
  const title = $('title').text();
  // log(title);

  // Instantiate hrefs array
  const hrefs = [];
  // Only crawl node links per pattern test
  $('a[href^="/docs/integrations"]').each(function handle() {
    const href = $(this).attr('href');
    if (/\/docs\/integrations\/.*\/.*\/.*/.test(href)) {
      hrefs.push(href);
    }
  });

};

const run2 = async () => {
  // $(hrefs).each(function(i) {
    // const doc = await fetch(domain+${hrefs[i]});
    const doc = await fetch('https://docs.newrelic.com/docs/integrations/host-integrations/host-integrations-list/mysql-monitoring-integration');
    const docBody = await doc.text();
    const $ = cheerio.load(docBody);
    $nodes_json = [];

    $('table tr').each(function(i){
      // log(`Table #${i}:`+$(this).text());
      const name = $(this).children().first().text();
      const description = $(this).children().last().text();
      $node_json = {"title": name, "description":description};
      $nodes_json.push($node_json);
    });

    log($nodes_json);

    // log(`Link #${i}: ${hrefs[i]}`);

};

// Run this bad boy!
run().catch(e => setImmediate(() => { throw e; }));
run2().catch(e => setImmediate(() => { throw e; }));
