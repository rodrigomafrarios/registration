# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Client code to register a new user just for testing

```
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: "REGION",
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: "REGION_YOUR_USER_POOL_ID",
    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: "YOUR_CLIENT_ID"
  }
});

Amplify.Auth.signUp({ 
  username: "email",
  password: "Abc@1234",
  attributes: {
    given_name: "John",
    family_name: "Doe" 
  } 
})
.then((response) => console.log(response))
.catch((err)=> console.error(err))
```

