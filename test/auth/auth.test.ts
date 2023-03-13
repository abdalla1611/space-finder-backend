

import { AuthService } from "./AuthService";
import { config } from "./config";
const authservice =  new AuthService();

const user  = authservice.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);