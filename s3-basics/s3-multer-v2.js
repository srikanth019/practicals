import AWS from "aws-sdk";
import fs from "fs";

export const s3FileUploadV2 = async (file) => {
  try {
    console.log(/file/, file);
    const s3 = new AWS.S3({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
    const fileStream = fs.createReadStream(file.path); // when we use multer -> diskStorage
    const param = {
      Bucket: process.env.PUBLIC_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: fileStream    //fileStream or file.buffer,
    };

    const result = await s3.upload(param).promise();
    console.log("File uploaded successfully:", result);
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Rethrow the error to propagate it
  }
};
