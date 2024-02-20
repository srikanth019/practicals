import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3FileUploadV3 = async (file) => {
  const s3 = new S3({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
  //   const fileStream = fs.createReadStream(file.path); //for (disk storage)
  const params = {
    Bucket: process.env.PUBLIC_BUCKET_NAME,
    Body: file.buffer, //file.buffer Based on multer storage(for memory storage)
    ContentType: `${file.mimetype}`,
    Key: `uploads/${Date.now()}-${file.originalname}`,
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    console.log(/res/, result);
    return result;
  } catch (error) {
    console.log("Getting issue while uploading image to S3: ", error);
    throw error; // Rethrow the error to propagate it
  }
};
