const fs = require("fs");
const express = require("express");
const status = require("express-status-monitor");

//Sync
// fs.writeFileSync("./test.txt", "Hello from fs!!!");
//Async
// fs.writeFile("./test.txt", "Hello from fs!!", (err) => {});

//Sync
// const result = fs.readFileSync("./sample-text-file.txt", "utf-8");
// console.log(/res/, result);
//Async
// fs.readFile("./sample-text-file.txt", "utf-8", (err, data) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(/data/, data);
// });

// fs.appendFileSync(
//   "./test.txt",
//   `${new Date().toLocaleDateString()} Hello fs\n`
// );

// fs.cpSync("./test.txt", "./copy.txt");
// fs.unlinkSync("./copy.txt");

const app = express();
app.use(status());

app.get("/", (req, res) => {
  //   fs.readFile("./sample-text-file.txt", (err, data) => {
  //     res.end(data);
  //   });
  const stream = fs.createReadStream("./sample-text-file.txt", "utf-8");
  stream.on("data", (chunk) => {
    res.write(chunk);
  });
  stream.on("end", () => {
    res.end();
  });
});

const { pipeline } = require("node:stream/promises");
const zlib = require("node:zlib");

async function run() {
  await pipeline(
    fs.createReadStream("./test.txt"),
    zlib.createGzip(),
    fs.createWriteStream("./text.zip")
  );
  console.log("Pipeline succeeded.");
}

run().catch(console.error);

app.listen(8000, () => {
  console.log("Server running on 8000");
});
