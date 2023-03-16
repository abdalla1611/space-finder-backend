

import { AuthService } from "./AuthService";
import { config } from "./config";
import * as AWS from "aws-sdk";

async function tester() {
    const authservice =  new AuthService();
    const user  = await authservice.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);
    await authservice.GetAWSTemporaryCreds(user);
    const creds = AWS.config.credentials; 
    console.log("debug line")
}
