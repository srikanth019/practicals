import { connect, set } from "mongoose";

import { DB_HOST, DB_DATABASE, DB_PORT, NODE_ENV } from "@config";

export const dbConnection = async () => {
  const dbConfig = {
    url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  };

  if (NODE_ENV !== "production") {
    set("debug", true);
  }

  await connect(dbConfig.url)
    .then(() => {
      console.log("Database connection successful");
    })
    .catch((err) => {
      console.log(err);
      console.error("Database connection error");
    });
};
