import { DynamoDB } from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda'
import { addCorsHeader } from '../Shared/Utils'

const TABLE_NAME = process.env.TABLE_NAME
const PRIMARY_KEY = process.env.PRIMARY_KEY
const dbClient = new DynamoDB.DocumentClient()

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: `hello from dynamoDB`,
  }
  addCorsHeader(result)
  try {
    if (event.queryStringParameters) {
      if (PRIMARY_KEY! in event.queryStringParameters) {
        result.body = await queryWithPrimaryPartition(event.queryStringParameters)
      } else {
        result.body = await queryWithSecondaryPartition(event.queryStringParameters)
      }
    } else {
      result.body = await scanTable()
    }
  } catch (error) {
    result.statusCode = 500
    result.body = error.message
  }

  return result
}

async function queryWithSecondaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const queryKey = Object.keys(queryParams)[0]
  const queryValue = queryParams[queryKey]
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      IndexName: queryKey,
      KeyConditionExpression: '#id = :val',
      ExpressionAttributeNames: {
        '#id': queryKey,
      },
      ExpressionAttributeValues: {
        ':val': queryValue,
      },
    })
    .promise()
  return JSON.stringify(queryResponse.Items)
}

async function queryWithPrimaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const keyValue = queryParams[PRIMARY_KEY!]
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      KeyConditionExpression: '#id = :val',
      ExpressionAttributeNames: {
        '#id': PRIMARY_KEY!,
      },
      ExpressionAttributeValues: {
        ':val': keyValue,
      },
    })
    .promise()
  return JSON.stringify(queryResponse.Items)
}

async function scanTable() {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!,
    })
    .promise()
  return JSON.stringify(queryResponse.Items)
}

export { handler }
