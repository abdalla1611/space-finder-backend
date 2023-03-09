import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from "uuid";


const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const item = typeof event.body=='object' ? event.body : JSON.parse(event.body);
    item.spaceId = v4();
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(`Created item with spaceId: ${item.spaceId}`)
    }

    try {
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
    } catch (error) {
        result.body = error.message;
    }
    return result;
}

export {handler};

