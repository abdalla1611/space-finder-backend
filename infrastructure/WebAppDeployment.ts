import { CfnOutput, Stack } from 'aws-cdk-lib'
import { CloudFrontWebDistribution } from 'aws-cdk-lib/aws-cloudfront'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { join } from 'path'

export class WebAppDeployment {
  private stack: Stack
  private bucketSuffix: string
  private deploymentBucket: Bucket
  constructor(stack: Stack, bucketSuffix: string) {
    this.stack = stack
    this.bucketSuffix = bucketSuffix
    this.initialize()
  }
  private initialize() {
    const bucketName = 'space-app-web' + this.bucketSuffix
    this.deploymentBucket = new Bucket(this.stack, 'space-app-web-id', {
      bucketName: bucketName,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
    })
    new BucketDeployment(this.stack, 'space-app-web-id-deplyment', {
      destinationBucket: this.deploymentBucket,
      sources: [
        Source.asset(join(__dirname, '..', '..', 'space-finder-frontend', 'build')),
      ],
    })

    new CfnOutput(this.stack, 'space-finder-webAppS3Url', {
      value: this.deploymentBucket.bucketWebsiteUrl,
    })

    const cloudFront = new CloudFrontWebDistribution(
      this.stack,
      'space-web-app-distribution',
      {
        originConfigs: [
          {
            behaviors: [{ isDefaultBehavior: true }],
            s3OriginSource: {
              s3BucketSource: this.deploymentBucket,
            },
          },
        ],
      }
    )

    new CfnOutput(this.stack, 'space-finder-webapp-cloudFrontURL', {
      value: cloudFront.distributionDomainName,
    })
  }
}
