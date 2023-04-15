import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  RestApi,
  MethodOptions,
  AuthorizationType,
  Cors
} from 'aws-cdk-lib/aws-apigateway'
import { GenericTable } from './GenericTable'
import { AuthorizerWrapper } from './auth/AuthorizerWrapper'
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3'
import { WebAppDeployment } from './WebAppDeployment'
import { Policies } from "./Policies";

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi',{
    defaultCorsPreflightOptions:{
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods:Cors.ALL_METHODS
    }
  })
  private authorizer: AuthorizerWrapper
  private suffix: string
  private spacePhotoBucket: Bucket
  private profilePhotoBucket: Bucket
  private policies: Policies
  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTable',
    primaryKey: 'spaceId',
    createLambdaPath: 'Create',
    readLambdaPath: 'Read',
    updateLambdaPath: 'Update',
    deleteLambdaPath: 'Delete',
    secondaryIndexes: ['location'],
  })
  private reserveationTable = new GenericTable(this, {
    tableName: 'ReservationTable',
    primaryKey: 'reservationId',
    createLambdaPath: 'Create',
    readLambdaPath: 'Read',
    updateLambdaPath: 'Update',
    deleteLambdaPath: 'Delete',
    secondaryIndexes: ['user'],
  })

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    this.initializeSuffix()
    this.initializeSpacesPhotoBucket()
    this.initializeProfilePhotoBucket()
    this.policies = new Policies(this.spacePhotoBucket, this.profilePhotoBucket)
    this.authorizer = new AuthorizerWrapper(
      this,
      this.api,
      this.policies
    )

    new WebAppDeployment(this, this.suffix)

    const optionWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    }

    // spaces API integration
    const spaceResource = this.api.root.addResource('spaces')
    spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration,optionWithAuth)
    spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration,optionWithAuth)
    spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration,optionWithAuth)
    spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration,optionWithAuth)

    const reservationResource = this.api.root.addResource('reservations')
    reservationResource.addMethod('POST', this.reserveationTable.createLambdaIntegration,optionWithAuth)
    reservationResource.addMethod('GET', this.reserveationTable.readLambdaIntegration,optionWithAuth)
    reservationResource.addMethod('PUT', this.reserveationTable.updateLambdaIntegration,optionWithAuth)
    reservationResource.addMethod('DELETE', this.reserveationTable.deleteLambdaIntegration,optionWithAuth)

  }

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split('/', this.stackId))
    const suffix = Fn.select(4, Fn.split('-', shortStackId))
    this.suffix = suffix
  }
  private initializeSpacesPhotoBucket() {
    this.spacePhotoBucket = new Bucket(this, 'spaces-photos', {
      bucketName: 'spaces-photos' + this.suffix,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })
    new CfnOutput(this, 'spaces-photos-bucket-name', {
      value: this.spacePhotoBucket.bucketName,
    })
  }

  private initializeProfilePhotoBucket(){
    this.spacePhotoBucket = new Bucket(this, 'profile-photos', {
      bucketName: 'profile-photos' + this.suffix,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })
    new CfnOutput(this, 'profile-photos-bucket-name', {
      value: this.spacePhotoBucket.bucketName,
    })
  }
}
