import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_9XHtdo0Cr",
  ClientId: "66f83va34t20lqnu58r886aaor",
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
