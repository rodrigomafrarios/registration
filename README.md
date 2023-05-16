# Welcome to your CDK TypeScript project

This is a registration service based on AWS Cognito.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Features

* Invite CRUD
* User CRUD

## Client code to register a new user (just for testing)

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


## 1) localstack setup

```
Reference: https://github.com/localstack/awscli-local

1.1) Install:
pip3 install localstack
pip3 install awscli-local

1.2) AWS Configure:
aws configure --profile test #or whatever profile name

1.3) Start localstack:
localstack start -d

alias awslocal="AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=${DEFAULT_REGION:-$AWS_DEFAULT_REGION} aws --endpoint-url=http://${LOCALSTACK_HOST:-localhost}:4566"

1.4) Verify e-mail identity:
awslocal --region us-east-1 ses verify-email-identity --email-address sender@mailfrom.com

```

## 2)