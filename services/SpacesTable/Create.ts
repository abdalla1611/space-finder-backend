import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { GenerateRandomId, GetEventBody } from "../Shared/Utils";
import { validateAsSpaceEntry, MissingFieldErorr} from "../Shared/InputValidator";


const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: "hello from Create"
    }

    try {
        const item = GetEventBody(event);
        item.spaceId = GenerateRandomId();
        validateAsSpaceEntry(item);
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
        result.body = JSON.stringify(`Created item with spaceId: ${item.spaceId}`)
    } catch (error) {
        if(error instanceof MissingFieldErorr){
            result.statusCode = 403;
        }
        else{
            result.statusCode = 500;
        }
        result.body = error.message;
    }
    return result;
}

export {handler};

