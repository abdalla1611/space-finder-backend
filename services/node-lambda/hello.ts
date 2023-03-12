import { S3 } from "aws-sdk";

const s3Client = new S3();

async function handler(event:any, context:any){
    
    const buckets = await s3Client.listBuckets().promise()
    console.log("bbb");
    return {
        statusCode: 200,
        body: 'here are my buckets: ' + JSON.stringify(buckets.Buckets)
    };
}

export {handler} ;