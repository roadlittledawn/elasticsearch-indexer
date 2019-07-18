# What does it do?
Experimental Node.js app to get content from non-product New Relic web properties and index them in an AWS Elasticsearch cluster. This can ultimately replace Swiftype which these web properties use to crawl their sites, index the pages, and serve that indexed data via API to provide search results for some of the sites.

This uses Node.js to run scripts, AWS Elasticsearch (in Clinton's account for now), and AWS DynamobDB to track crawler history and lookup Elasticsearch IDs (in Clinton's account for now).

## Installation
Work in Progress

## How to run
Run `npm start`.

To run specific web property crawler file: 
1. Update package.json with the script name and path. 
2. Run `npm run NAME` where NAME is the name you set in package.json.

## How it crawls docs

## AWS Access / Permissions
Uses Node.js AWS SDK to run client and authenticate requests as a user Clinton set up in his personal account. `GET` and `POST` requests are allowed via the following IP addresses. The admin user can also run `PUT` and `DELETE` requests from the following IP addresses:
* `38.104.104.46`
* `67.171.204.51`
* `38.104.105.178`

## TODO
* Add paginating through docs endpoint
* Add crawler for non-docs web property for further proof of concept
* Convert `searchIndexID` property to number for sorting within DynamobDB
