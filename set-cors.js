const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const S3 = new S3Client({
  region: 'auto',
  endpoint: 'https://7033b60f5a7f3e258bf145307b526d19.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'df6d38ccb9e0f6214a9d2da7683eab1b',
    secretAccessKey: '8c16a987cb4641694f42ee8aae46435939752c6546cfbfa942221c37e26c3eb9',
  },
  forcePathStyle: true,
});

const command = new PutBucketCorsCommand({
  Bucket: 'portfolio-media',
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedHeaders: ['*', 'content-type', 'Content-Type', 'Authorization'],
        ExposeHeaders: [],
        MaxAgeSeconds: 3000,
      },
    ],
  },
});

S3.send(command)
  .then(() => console.log('CORS POLICY SUCCESSFULLY APPLIED!'))
  .catch((err) => console.error('ERROR APPLYING CORS:', err));
