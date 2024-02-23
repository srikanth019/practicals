const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

//TODO:Not Working Properly
// const client = new Client({
//   node: "https://getting-started-with-elk.kb.ap-south-1.aws.elastic-cloud.com:9243/",
// });
// const client = new Client({
//   cloud: {
//     id: "Getting_Started_with_ELK:YXAtc291dGgtMS5hd3MuZWxhc3RpYy1jbG91ZC5jb206NDQzJDc3YTc2MGIwZDE0NjQwY2E4MzNkMGRiMzkzZmNhYTIwJDk1NmU3MGNhNTUyZjQ3MDhiYjFiMmIzZDY2MmUyYmEy",
//   },
//   auth: {
//     apiKey:
//       "essu_ZEhsV1h6RkpNRUpPUzAxalZuSlFVbXM1Y25jNk9XOTBhRzVNTVhWVVdFZHhOVlZWVmtKeGFrNVFkdz09AAAAANgqciU=",
//   },
// });

const client = new Client({
  node: process.env.CLIENT_NODE,
  auth: {
    username: process.env.CLIENT_USER_NAME,
    password: process.env.CLIENT_PASSWORD,
  },
});

module.exports = client;
