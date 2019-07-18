const fetch = require('node-fetch');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();
const crawlHistory = require('./crawl-history.js');
const crawlQueue = require('./crawl-queue.js');

const { log } = console;


const domain = "blog.newrelic.com";

const run = async () => {
  const res = await fetch(`https://${domain}`);
  const body = await res.text();
  const $ = cheerio.load(body);

  const title = $('title').text();
  log(title);
  $('a[href]').each(function getLinkInfo(i) {
    const href = $(this).attr('href');
    if ( href.match(/blog.newrelic.com/g) ) {
      log(`Link #${i}: ${href}`);
    }
  });
};

// Run this bad boy!
run().catch(e => setImmediate(() => { throw e; }));
