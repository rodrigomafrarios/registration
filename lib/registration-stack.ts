import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
    AccountRecovery, ClientAttributes, OAuthScope, ProviderAttribute, StringAttribute, UserPool,
    UserPoolClient, UserPoolClientIdentityProvider, UserPoolIdentityProviderFacebook,
    UserPoolIdentityProviderGoogle, UserPoolOperation
} from 'aws-cdk-lib/aws-cognito';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

import path = require('path');
export interface IdentityProviders {
  facebook?: IdentityProviderProps
  google?: IdentityProviderProps
  apple?: IdentityProviderProps
}

export interface IdentityProviderProps {
  clientId: string
  clientSecret: string
}

export interface AuthStackProps extends StackProps {
  identityProviders: IdentityProviders
  cognitoUserPoolRedirectURI: string
}

export class RegistrationStack extends Stack {
  readonly userPool: UserPool

  readonly userPoolClient: UserPoolClient

  readonly updateUserPoolClient: NodejsFunction

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props)

    const { identityProviders } = props
    const { facebook, google } = identityProviders

    this.userPool = new UserPool(this, "UserPool", {
      userPoolName: `auth-pool`,
      selfSignUpEnabled: true,
      autoVerify: {
        email: false,
        phone: false,
      },
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        givenName: {
          mutable: true,
          required: true,
        },
        familyName: {
          mutable: true,
          required: true,
        },
      },
      customAttributes: {
        userId: new StringAttribute({ mutable: true }),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    let googleIdp
    if (google) {
      googleIdp = new UserPoolIdentityProviderGoogle(
        this,
        "GoogleIDP",
        {
          clientId: google.clientId,
          clientSecret: google.clientSecret,
          userPool: this.userPool,
          scopes: ["openid", "profile", "email"],
          attributeMapping: {
            email: ProviderAttribute.GOOGLE_EMAIL,
            familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
            givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
            custom: {
              email_verified: ProviderAttribute.other("email_verified"),
            },
          },
        }
      )

      googleIdp.node.addDependency(this.userPool)
    }

    let facebookIdp
    if (facebook) {
      facebookIdp = new UserPoolIdentityProviderFacebook(
        this,
        "FacebookIDP",
        {
          clientId: facebook.clientId,
          clientSecret: facebook.clientSecret,
          apiVersion: "v6.0",
          userPool: this.userPool,
          scopes: ["public_profile", "email"],
          attributeMapping: {
            email: ProviderAttribute.FACEBOOK_EMAIL,
            givenName: ProviderAttribute.FACEBOOK_FIRST_NAME,
            familyName: ProviderAttribute.FACEBOOK_LAST_NAME,
          },
        }
      )
      facebookIdp.node.addDependency(this.userPool)
    }

    this.userPoolClient = new UserPoolClient(this, "userPoolClient", {
      userPool: this.userPool,
      preventUserExistenceErrors: false,
      refreshTokenValidity: Duration.days(1),
      writeAttributes: new ClientAttributes().withStandardAttributes({
        email: true,
        givenName: true,
        familyName: true,
      }),
      readAttributes: new ClientAttributes()
        .withStandardAttributes({
          givenName: true,
          familyName: true,
          email: true,
        })
        .withCustomAttributes(
          "custom:userId"
        ),
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          OAuthScope.PHONE,
          OAuthScope.EMAIL,
          OAuthScope.PROFILE,
          OAuthScope.OPENID,
          OAuthScope.COGNITO_ADMIN,
        ],
      },
      supportedIdentityProviders: [
        // UserPoolClientIdentityProvider.FACEBOOK,
        // UserPoolClientIdentityProvider.GOOGLE,
        UserPoolClientIdentityProvider.COGNITO,
      ],
    })

    if (googleIdp) {
      this.userPoolClient.node.addDependency(googleIdp)
    }

    const preSignUpHook = new NodejsFunction(this, "PreSignupHook", {
      entry: path.join(
        __dirname,
        "./resources/auth/pre-signup-trigger.ts"
      ),
      handler: "handler",
    })

    this.userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, preSignUpHook)

    new CfnOutput(this, "UserPoolOutput", {
      exportName: "UserPool",
      value: this.userPool.userPoolArn,
    })
    new CfnOutput(this, "UserPoolClientId", {
      exportName: "userPoolClientId",
      value: this.userPoolClient.userPoolClientId,
    })
  }
}
