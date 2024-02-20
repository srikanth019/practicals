import express from "express";
import upload from "./multer.js";
import multer from "multer";

const app = express();

//For single file
app.post("/upload", upload.single("file"), (req, res) => {
  console.log(/req/, req.file);
  res.json({ msg: "Upload file into S3", file: req.file });
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

app.use("/", (req, res) => {
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
