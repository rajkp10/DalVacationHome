// Import AWS SDK and initialize DynamoDB DocumentClient
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' }); // Specify your AWS region
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Log the entire request for debugging purposes
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Check if the queryResult exists
    if (!event.queryResult) {
        return {
            status: 500,
            data: JSON.stringify({"message":"Cannot find queryResult in the Dialogflow payload"})
        };
    }

    // Extract queryResult
    const { parameters, queryText, action, allRequiredParamsPresent, intent, outputContexts } = event.queryResult;
    const response = {
      status: 200,
      data: JSON.stringify({ parameters, queryText, action, allRequiredParamsPresent, intent, outputContexts}),
      parameters, 
      queryText, 
      action, 
      allRequiredParamsPresent, 
      outputContexts,
      intent
    }
    
    console.log(response)
    
    return response;
};
