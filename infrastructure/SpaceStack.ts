import { Stack, StackProps} from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi, LambdaIntegration, MethodOptions, AuthorizationType } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";

export class SpaceStack extends Stack{

    private api = new RestApi(this, 'SpaceApi');
    private authorizer: AuthorizerWrapper;
    private spacesTable = new GenericTable(this,{
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location']
    });

    
    constructor(scope: Construct,id: string ,props: StackProps){
        super(scope, id, props)

        this.authorizer = new AuthorizerWrapper(this,this.api)

        const  nodeJSLambda = new NodejsFunction(this,'hello node-js',{
            entry:join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
            handler: 'handler'
        })

        // define a policy to the lambda
        const s3listPolicy = new PolicyStatement()
        s3listPolicy.addActions('s3:ListAllMyBuckets')
        s3listPolicy.addResources('*')

        // add the policy to the lambda

        nodeJSLambda.addToRolePolicy(s3listPolicy)

        const optionWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer:{
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }
        //hello api lambda integration
        const helloIntegration = new LambdaIntegration(nodeJSLambda)
        const helloResource = this.api.root.addResource('hello')
        helloResource.addMethod('GET', helloIntegration,optionWithAuth)

        // spaces API integration
        const spaceResource = this.api.root.addResource('spaces')
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration)
        spaceResource.addMethod('GET',this.spacesTable.readLambdaIntegration)
        spaceResource.addMethod('PUT',this.spacesTable.updateLambdaIntegration)
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration)

    }
    

}