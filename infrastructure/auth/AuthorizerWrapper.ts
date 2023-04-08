import { Construct } from 'constructs'
import { RestApi, CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway'
import { UserPool, UserPoolClient, CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito'
import { CfnOutput } from 'aws-cdk-lib'
import { IdentityPoolWrapper } from './IdentityPoolWrapper'

export class AuthorizerWrapper {
  private scope: Construct
  private api: RestApi
  private userPool: UserPool
  private userPoolClient: UserPoolClient
  public authorizer: CognitoUserPoolsAuthorizer
  private identityPoolWrapper: IdentityPoolWrapper
  private photoBucketArn: string
  constructor(scope: Construct, api: RestApi, photoBucketArn: string) {
    this.scope = scope
    this.api = api
    this.photoBucketArn = photoBucketArn
    this.initialize()
  }

  private initialize() {
    this.createUserPool()
    this.addUserPoolClient()
    this.createAuthorizer()
    this.initializeIdentityPoolWrapper()
    this.createAdminsGroup()
  }

  private createAdminsGroup() {
    new CfnUserPoolGroup(this.scope, 'admins', {
      groupName: 'admins',
      userPoolId: this.userPool.userPoolId,
      roleArn: this.identityPoolWrapper.adminRole.roleArn,
    })
  }

  private createAuthorizer() {
    this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceUserAuthorizer', {
      cognitoUserPools: [this.userPool],
      authorizerName: 'SpaceUserAuthorizer',
      identitySource: 'method.request.header.Authorization',
    })

    this.authorizer._attachToApi(this.api)
  }
  private addUserPoolClient() {
    this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
      userPoolClientName: 'SpaceUserPool-client',
      authFlows: {
        userPassword: true,
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      generateSecret: false,
    })

    new CfnOutput(this.scope, 'UserPoolClientID', {
      value: this.userPoolClient.userPoolClientId,
    })
  }
  private createUserPool() {
    this.userPool = new UserPool(this.scope, 'SpaceUserPool', {
      userPoolName: 'SpaceUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    })

    new CfnOutput(this.scope, 'UserPoolID', {
      value: this.userPool.userPoolId,
    })
  }

  private initializeIdentityPoolWrapper() {
    this.identityPoolWrapper = new IdentityPoolWrapper(
      this.scope,
      this.userPool,
      this.userPoolClient,
      this.photoBucketArn
    )
  }
}
