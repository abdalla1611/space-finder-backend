import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { GetEventBody } from "../Shared/Utils";


const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY
const dbClient = new DynamoDB.DocumentClient();

async function handler(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(`hello from Update`)
    }

    try {
        const requestBody = GetEventBody(event);
        const spaceId = event.queryStringParameters?.[PRIMARY_KEY!]
    
        if (requestBody && spaceId) {
    
            const requestBodyKey = Object.keys(requestBody)[0];
            const requestBodyValue = requestBody[requestBodyKey]; 
            const updateResult = await dbClient.update({
                TableName:TABLE_NAME!,
                Key:{
                    [PRIMARY_KEY!]:spaceId
                },
                UpdateExpression: 'set #zzNew  = :new',
                ExpressionAttributeValues:{
                    ':new': requestBodyValue
                },
                ExpressionAttributeNames:{
                    '#zzNew':requestBodyKey
                },
                ReturnValues:'UPDATED_NEW'
            }).promise();
            result.body = JSON.stringify(updateResult)
        }
    } catch (error) {
        result.statusCode = 500;
        result.body = error.message;
    }

    return result
}

export {handler};

