import { NextResponse } from "next/server";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
});

export async function GET() {
  try {
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "portfolio-media";

    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });

    await S3.send(command);

    return NextResponse.json({ success: true, message: "CORS Policy successfully applied to Cloudflare R2 bucket: " + bucketName });
  } catch (error: any) {
    console.error("Error setting CORS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
