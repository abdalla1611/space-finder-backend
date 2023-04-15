import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { GenerateRandomId, GetEventBody, addCorsHeader } from '../Shared/Utils'
import { MissingFieldErorr, validateAsReservationEntry } from '../Shared/InputValidator'

const TABLE_NAME = process.env.TABLE_NAME
const dbClient = new DynamoDB.DocumentClient()

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'hello from Create',
  }
  addCorsHeader(result)

  try {
    const item = GetEventBody(event)
    item.state = 'PENDING'
    item.reservationId = GenerateRandomId()
    validateAsReservationEntry(item)
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise()
    result.body = JSON.stringify({
      id: item.reservationId,
    })
  } catch (error) {
    if (error instanceof MissingFieldErorr) {
      result.statusCode = 400
    } else {
      result.statusCode = 500
    }
    result.body = JSON.stringify(error.message)
  }
  return result
}

export { handler }
