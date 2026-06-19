import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure the S3 Client for Cloudflare R2
const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
    }

    // Create a unique file name
    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "portfolio-media";

    // Create the command for a PUT request
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // Generate the pre-signed URL (expires in 15 minutes)
    const presignedUrl = await getSignedUrl(S3, command, { expiresIn: 900 });

    // The final public URL where the file can be accessed after upload
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${uniqueFileName}`;

    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error: any) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
