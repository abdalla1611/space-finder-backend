import { Stack, StackProps} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function as LambdaFunction, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class SpaceStack extends Stack{

    private api = new RestApi(this, 'SpaceApi')
    private spacesTable = new GenericTable(this,{
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        secondaryIndexes: ['location']
    })

    
    constructor(scope: Construct,id: string ,props: StackProps){
        super(scope, id, props)

     
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
        //hello api lambda integration

        const helloIntegration = new LambdaIntegration(nodeJSLambda)
        const helloResource = this.api.root.addResource('hello')
        helloResource.addMethod('GET', helloIntegration)

        // spaces API integration
        const spaceResource = this.api.root.addResource('spaces')
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration)
        spaceResource.addMethod('GET',this.spacesTable.readLambdaIntegration)

    }
    

}