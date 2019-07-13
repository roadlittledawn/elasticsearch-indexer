const AWS = require('aws-sdk');
const date = require('date-and-time');

/*
Store crawl history and search index ID for each record.
  * Check history for page (either with known search index ID OR via URL)
  * If history exists, get search index ID. 
  * If no history, we know we have to get auto-assigned ID and add new record in history
  * 

*/

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

    // docClient = require('util').promisify(docClient)
    // var data = await docClient(params);

    // console.log(data.Item.Name);
    // return handlerInput.responseBuilder
    //     .speak(data.Item.Name)
    //     .getResponse();

    // docClient.get(params, function (err, data) {

    //   if (err) {
    //       // console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    //       result = JSON.stringify(err, null, 2);
    //   } 
    //   if (Object.keys(data).length === 0 && data.constructor === Object) {
    //       // console.error('No result found');
    //       result = null;
    //   }
    //   else {
    //       // console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    //       result = JSON.stringify(data, null, 2);
    //   }
      
    // });
    docClient.get(params).promise()
    .then(function(data) {
      console.log(data);
    })
    .catch(function(err) {
      console.log(err);
    });
  },
  recordCrawl: function (id, url) {

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
          "id": id,
          "pageUrl": url,
          "lastCrawled": yearMonthDateTime,
          "lastIndexResult" : "created"
      }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });

  }

};
module.exports = methods;
