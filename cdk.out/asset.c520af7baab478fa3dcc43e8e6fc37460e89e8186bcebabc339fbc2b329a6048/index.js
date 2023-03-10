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

// services/SpacesTable/Create.ts
var Create_exports = {};
__export(Create_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(Create_exports);
var import_aws_sdk = require("aws-sdk");

// services/Shared/Utils.ts
function GenerateRandomId() {
  return Math.random().toString(36).slice(2);
}
function GetEventBody(event) {
  return typeof event.body == "object" ? event.body : JSON.parse(event.body);
}

// services/Shared/InputValidator.ts
var MissingFieldErorr = class extends Error {
};
function validateAsSpaceEntry(arg) {
  if (!arg.name) {
    throw new MissingFieldErorr("Value for name required!");
  }
  if (!arg.spaceId) {
    throw new MissingFieldErorr("Value for spaceId required!");
  }
  if (!arg.location) {
    throw new MissingFieldErorr("Value for location required!");
  }
}

// services/SpacesTable/Create.ts
var TABLE_NAME = process.env.TABLE_NAME;
var dbClient = new import_aws_sdk.DynamoDB.DocumentClient();
async function handler(event, context) {
  const result = {
    statusCode: 200,
    body: "hello from Create"
  };
  try {
    const item = GetEventBody(event);
    item.spaceId = GenerateRandomId();
    validateAsSpaceEntry(item);
    await dbClient.put({
      TableName: TABLE_NAME,
      Item: item
    }).promise();
    result.body = JSON.stringify(`Created item with spaceId: ${item.spaceId}`);
  } catch (error) {
    if (error instanceof MissingFieldErorr) {
      result.statusCode = 403;
    } else {
      result.statusCode = 500;
    }
    result.body = error.message;
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
