
import { Construct } from "constructs";
import { RestApi, CognitoUserPoolsAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
import { CfnOutput } from "aws-cdk-lib";

export class AuthorizerWrapper{

    private scope: Construct;
    private api: RestApi;
    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer :CognitoUserPoolsAuthorizer

    constructor(scope: Construct, api:RestApi){
        this.scope = scope;
        this.api = api;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.createAdminsGroup();
    }

    private createAdminsGroup() {

        new CfnUserPoolGroup(this.scope,'admins', {
            groupName: 'admins',
            userPoolId: this.userPool.userPoolId
        })
    }

    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope,'SpaceUserAuthorizer',{
            cognitoUserPools:[this.userPool],
            authorizerName: 'SpaceUserAuthorizer',
            identitySource: 'method.request.header.Authorization'
        })

        this.authorizer._attachToApi(this.api)
    }
    private addUserPoolClient() {
        this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
            userPoolClientName:'SpaceUserPool-client',
            authFlows:{
                userPassword:true,
                adminUserPassword: true,
                custom: true,
                userSrp:true
            },
            generateSecret:false
        })

        new CfnOutput(this.scope,'UserPoolClientID',{
            value:this.userPoolClient.userPoolClientId
        });


    }
    private createUserPool() {
        this.userPool = new UserPool(this.scope,'SpaceUserPool',{
            userPoolName: 'SpaceUserPool',
            selfSignUpEnabled: true,
            signInAliases:{
                username: true,
                email: true
            }
        });

        new CfnOutput(this.scope,'UserPoolID',{
            value:this.userPool.userPoolId
        });

    }





}