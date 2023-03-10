import { APIGatewayProxyEvent } from "aws-lambda";



export function GenerateRandomId() : string {
    return Math.random().toString(36).slice(2); 
    
}

export function GetEventBody(event: APIGatewayProxyEvent) {
    return typeof event.body=='object' ? event.body : JSON.parse(event.body);
}