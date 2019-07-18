const AWS = require('aws-sdk');
const date = require('date-and-time');
const dotenv = require('dotenv');
dotenv.config();
const { log } = console;

var methods = {

  checkHistory: async function (url) {
    AWS.config.update({
      region: "us-west-2",
      endpoint: "https://dynamodb.us-west-2.amazonaws.com"
    });

    var params = {
      TableName: "crawl_history",
      Key : {
        "pageUrl" : url
      }
    };

    const docClient = new AWS.DynamoDB.DocumentClient();

    // Non-promise returned. This was the example in AWS docs for node.js
    //
    // docClient.get(params, function (err, data) {

    //   if (err) {
    //       console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    //       result = JSON.stringify(err, null, 2);
    //   } 
    //   if (Object.keys(data).length === 0 && data.constructor === Object) {
    //       console.error('No result found');
    //       result = null;
    //   }
    //   else {
    //       console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    //       result = JSON.stringify(data, null, 2);
    //       return result;
    //   }
      
    // });
    
    return docClient.get(params).promise()
    .then(function(data) {
      if (Object.keys(data).length === 0 && data.constructor === Object) {
        return null;
      }
      else {
        return data.Item;
      }
      
    })
    .catch(function(err) {
      console.log(err);
    });
  },

  recordCrawl: async function (id, url, lastIndexResult) {

    AWS.config.update({
        region: "us-west-2",
        endpoint: "https://dynamodb.us-west-2.amazonaws.com"
    });

    var docClient = new AWS.DynamoDB.DocumentClient();
    // Get current timestamp to include in record
    var now = new Date();
    // Format it with date-and-time module
    var yearMonthDateTime = date.format(now, 'YYYY-MM-DD HH:mm:ss');

    var params = {
      TableName: "crawl_history",
      Item:{
          "searchIndexID": parseInt(id),
          "pageUrl": url,
          "lastCrawled": yearMonthDateTime,
          "lastIndexResult" : lastIndexResult
      },
      ReturnValues: 'ALL_OLD',
    };

    // Non-promise returned. This was the example in AWS docs for node.js
    //
    // console.log("Adding a new item...");
    // docClient.put(params, function(err, data) {
    //     if (err) {
    //         console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         console.log("Added item:", JSON.stringify(data, null, 2));
    //     }
    // });
    log("Crawl history updated");
    return docClient.put(params).promise()
    .then(function(data) {
      return data; 
    })
    .catch(function(err) {
      console.log(err);
    });

  }

};
module.exports = methods;
