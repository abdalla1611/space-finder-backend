"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// services/SpacesTable/Update.ts
var Update_exports = {};
__export(Update_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(Update_exports);
var import_aws_sdk = require("aws-sdk");

// services/Shared/Utils.ts
function GetEventBody(event) {
  return typeof event.body == "object" ? event.body : JSON.parse(event.body);
}
function addCorsHeader(result) {
  result.headers = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*"
  };
}

// services/SpacesTable/Update.ts
var TABLE_NAME = process.env.TABLE_NAME;
var PRIMARY_KEY = process.env.PRIMARY_KEY;
var dbClient = new import_aws_sdk.DynamoDB.DocumentClient();
async function handler(event, context) {
  var _a;
  const result = {
    statusCode: 200,
    body: JSON.stringify(`hello from Update`)
  };
  addCorsHeader(result);
  try {
    const requestBody = GetEventBody(event);
    const spaceId = (_a = event.queryStringParameters) == null ? void 0 : _a[PRIMARY_KEY];
    if (requestBody && spaceId) {
      const requestBodyKey = Object.keys(requestBody)[0];
      const requestBodyValue = requestBody[requestBodyKey];
      const updateResult = await dbClient.update({
        TableName: TABLE_NAME,
        Key: {
          [PRIMARY_KEY]: spaceId
        },
        UpdateExpression: "set #zzNew  = :new",
        ExpressionAttributeValues: {
          ":new": requestBodyValue
        },
        ExpressionAttributeNames: {
          "#zzNew": requestBodyKey
        },
        ReturnValues: "UPDATED_NEW"
      }).promise();
      result.body = JSON.stringify(updateResult);
    }
  } catch (error) {
    result.statusCode = 500;
    result.body = error.message;
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
