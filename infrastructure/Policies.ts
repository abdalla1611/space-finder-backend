
import { PolicyStatement ,Effect } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";

export class Policies{
    private spacesPhotoBucket: Bucket;
    private profilePhotoBucket: Bucket;
    public uploadProfilePhoto : PolicyStatement;
    public uploadSpacePhoto : PolicyStatement;

    constructor(spacesPhotoBucket: Bucket, profilePhotoBucket: Bucket){
        this.profilePhotoBucket = profilePhotoBucket
        this.spacesPhotoBucket = spacesPhotoBucket
        this.initialize()
    }
    private initialize(){
        this.uploadProfilePhoto = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:PutObject', 's3:PutObjectAcl'],
            resources: [this.profilePhotoBucket.bucketArn + '/*'],
        })

        this.uploadSpacePhoto = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:PutObject', 's3:PutObjectAcl'],
            resources: [this.spacesPhotoBucket.bucketArn + '/*'],
        })
    }
}