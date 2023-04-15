import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { addCorsHeader, GetEventBody, isIncludedInGroup } from '../Shared/Utils'

const TABLE_NAME = process.env.TABLE_NAME
const PRIMARY_KEY = process.env.PRIMARY_KEY
const dbClient = new DynamoDB.DocumentClient()

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(`hello from Update`),
  }
  addCorsHeader(result)

  try {
    if(isIncludedInGroup('admins',event)){

    const requestBody = GetEventBody(event)
    const newState = 'state' in requestBody ? requestBody.state : ''
    const reservationId = event.queryStringParameters?.[PRIMARY_KEY!]

    if (reservationId && isValidState(newState)) {
      const requestBodyKey = Object.keys(requestBody)[0]
      const requestBodyValue = requestBody[requestBodyKey]
      const updateResult = await dbClient
        .update({
          TableName: TABLE_NAME!,
          Key: {
            [PRIMARY_KEY!]: reservationId,
          },
          UpdateExpression: 'set #zzNew  = :new',
          ExpressionAttributeValues: {
            ':new': requestBodyValue,
          },
          ExpressionAttributeNames: {
            '#zzNew': requestBodyKey,
          },
          ReturnValues: 'UPDATED_NEW',
        })
        .promise()
      result.body = JSON.stringify(updateResult)
    }
    else{
      result.statusCode = 400
      result.body = JSON.stringify('Invalid Request')
    }
  }
  else{
    result.statusCode = 403
    result.body = JSON.stringify('Not Authorized!')
  }
  } catch (error) {
    result.statusCode = 500
    result.body = error.message
  }

  return result
}

function isValidState(state: any){
  if(state == 'PENDING' ||
     state == 'APPROVED' ||
     state == 'CANCELED'){
      return true
     } else{
      return false
     }
}

export { handler }
