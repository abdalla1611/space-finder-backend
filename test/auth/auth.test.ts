import { AuthService } from "./AuthService";
import { config } from "./config";
import * as AWS from "aws-sdk";

AWS.config.region = config.REGION;

async function getBuckets() {

    let buckets;
    try {
        buckets = await new AWS.S3().listBuckets().promise();
    } catch (error) {
        buckets = undefined;
    }

    return buckets;    
}

async function tester() {
    const authservice =  new AuthService();
    const user  = await authservice.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);
    await authservice.GetAWSTemporaryCreds(user);
    const creds = AWS.config.credentials;
    const buckets = await getBuckets();
    console.log("debug line")
}

tester()