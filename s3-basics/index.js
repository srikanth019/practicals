import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAXYKJTGKRC2STM6LJ",
    secretAccessKey: "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",
  },
});

const getObjUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: "srikanthgolla-private",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 30 });
  return url;
};

const putObject = async (filename, contentType) => {
  const command = new PutObjectCommand({
    Bucket: "srikanthgolla-private",
    Key: `users/uploads/${filename}`,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 20 }); // expireIn is optional
  return url;
};

const getObjects = async () => {
  const command = new ListObjectsV2Command({
    Bucket: "srikanthgolla-private",
    Key: "/",
  });
  const files = await s3Client.send(command);
  console.log(/files/, files);
};

const deleteObject = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "srikanthgolla-private",
    Key: key,
  });
  await s3Client.send(command);
};

// getObjects();
// deleteObject("Screenshot from 2023-12-28 17-23-47.png");
const main = async () => {
  console.log(/url/, await getObjUrl("users/uploads/video-1708347200004"));
  //   console.log(await putObject(`video-${Date.now()}`, "video/mp4"));
};

main();
