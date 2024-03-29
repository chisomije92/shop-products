import mongodb from "mongodb";
import { MongoClient } from "mongodb";

import dotenv from "dotenv";

dotenv.config();

let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
  conn_string = process.env.MONGO_CONN_STRING;
} else {
  throw new Error("MONGO_CONN_STRING is not set");
}

let _db: mongodb.Db | null;

const mongoConnect = (cb: () => void) => {
  MongoClient.connect(conn_string)
    .then((client) => {
      _db = client.db();
      cb();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

export const getDb = () => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found. Please connect first.");
};

export default mongoConnect;
