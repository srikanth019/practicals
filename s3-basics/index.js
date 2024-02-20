import express from "express";
import upload from "./multer.js";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import util from "util";
import { s3FileUploadV2 } from "./s3-multer-v2.js";
import { s3FileUploadV3 } from "./s3-multer-v3.js";

const unlinkFile = util.promisify(fs.unlink);
const app = express();

//For single file
app.post("/upload", upload.single("image"), async (req, res) => {
  const { file } = req;
  const result = await s3FileUploadV2(file);
  // const result = await s3FileUploadV3(file);
  // await unlinkFile(file.path);  // If we use disk storage then we will use the this one to remove local Files.
  return res.json({ msg: "Success", result });
});

//Multiple file single file  -Limit is optional(2)
app.post("/multiple-files-upload", upload.array("files", 2), (req, res) => {
  console.log(/req/, req.files);
  res.json({ msg: "Upload file into S3", file: req.files });
});

//Multiple file single file
const multiUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);
app.post("/files-multiple-fields-upload", multiUpload, (req, res) => {
  console.log(/req/, req.files);
  res.json({ msg: "Upload file into S3", files: req.files });
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello from AWS S3." });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = "Internal Server Error";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large";
        break;
      case "LIMIT_FILE_COUNT":
        message = "File limit reached";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "File must be an image";
        break;
    }

    return res.status(400).json({ message });
  }

  // If no Multer error occurred, proceed to the next middleware
  next();
});

app.listen(6000, () => {
  console.log("Server running on port 6000");
});
