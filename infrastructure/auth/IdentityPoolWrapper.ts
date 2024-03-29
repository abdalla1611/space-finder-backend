import { Construct } from 'constructs'
import {
  UserPool,
  UserPoolClient,
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
} from 'aws-cdk-lib/aws-cognito'
import { CfnOutput } from 'aws-cdk-lib'
import { Role, FederatedPrincipal } from 'aws-cdk-lib/aws-iam'
import { Policies } from '../Policies'

export class IdentityPoolWrapper {
  private scope: Construct
  private userPool: UserPool
  private userPoolClient: UserPoolClient
  private IdentityPool: CfnIdentityPool
  private authenticatedRole: Role
  private unAuthenticatedRole: Role
  public adminRole: Role
  private policies: Policies

  constructor(scope: Construct,userPool: UserPool,userPoolClient: UserPoolClient,policies: Policies) {
    this.scope = scope
    this.userPool = userPool
    this.userPoolClient = userPoolClient
    this.policies = policies
    this.initialize()
  }

  private initialize() {
    this.initializeIdentityPool()
    this.initializeRoles()
    this.attachRoles()
  }

  private initializeIdentityPool() {
    this.IdentityPool = new CfnIdentityPool(this.scope, 'SpaceFinderIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    })

    new CfnOutput(this.scope, 'IdentityPoolId', {
      value: this.IdentityPool.ref,
    })
  }

  private initializeRoles() {
    this.authenticatedRole = new Role(this.scope, 'CognitoDefualtAuthenticatdRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })
    this.authenticatedRole.addToPolicy(this.policies.uploadProfilePhoto)

    this.unAuthenticatedRole = new Role(this.scope, 'CognitoDefualtUnAuthenticatdRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })

    this.adminRole = new Role(this.scope, 'CognitoAdminRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    })

    this.adminRole.addToPolicy(this.policies.uploadSpacePhoto)
    this.adminRole.addToPolicy(this.policies.uploadProfilePhoto)

  }

  private attachRoles() {
    new CfnIdentityPoolRoleAttachment(this.scope, 'RolesAttachment', {
      identityPoolId: this.IdentityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unAuthenticatedRole.roleArn,
      },
      roleMappings: {
        adminsMapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
        },
      },
    })
  }
}
