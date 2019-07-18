const AWS = require('aws-sdk');
const date = require('date-and-time');
const dotenv = require('dotenv');
dotenv.config();
const { log } = console;

var methods = {

addToQueue: async function (url, domain) {

  AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
  });
  var params = {
    TableName: "crawl_queue",
    Item:{
      "pageUrl": url,
      "domain": domain,
    },
    ReturnValues: 'ALL_OLD',
  };

  var docClient = new AWS.DynamoDB.DocumentClient();

  return docClient.put(params).promise()
  .then(function(data) {
    log(`Added to crawl queue`);
    return data; 
  })
  .catch(function(err) {
    console.log(err);
  });

},

removeFromQueue: async function (url) {
  
},

};

module.exports = methods;
