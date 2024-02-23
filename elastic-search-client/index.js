const client = require("./client");
const fs = require("fs");
const path = require("path");
const split = require("split");

const run = async () => {
  const response = await client.info();
  //   const response = await client.index({
  //     index: "my-test-index",
  //     id: "1",
  //     refresh: true,
  //     body: {
  //       msg: "Hello from ELK",
  //       foo: "foo",
  //       bar: "bar",
  //     },
  //     // document: {
  //     //   foo1: "foo",
  //     //   bar1: "bar",
  //     // },
  //   });

  console.log(response);

  const getIndex = await client.get({
    index: "my-test-index",
    id: "1",
  });
  console.log(getIndex);
};
run().catch((err) => {
  console.log(/err/, err);
  process.exit(1);
});

const prepare = async () => {
  const { body: exist } = await client.indices.exists({ index: "test-data" });
  if (exist) return;
  await client.indices.create({
    index: "test-data",
    body: {
      mappings: {
        dynamic: "strict",
        properties: {
          id: { type: "keyword" },
          name: { type: "text" },
          age: { type: "integer" },
        },
      },
    },
  });
};

const index = async () => {
  const dataPata = path.join(__dirname, "resources", "sample.ndjson");
  const datasource = fs.createReadStream(dataPata);
  console.log(/datasource/, datasource);
  const result = await client.helpers.bulk({
    //for datasource we can use array of objects [{}, {}] with same mapping
    datasource: datasource,
    onDocument(doc) {
      return {
        index: { _index: "test-data" },
      };
    },
  });

  console.log(/res/, result);
};

// prepare()
//   .then(index())
//   .catch((err) => {
//     console.log(err);
//   });
