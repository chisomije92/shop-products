import mongodb from "../mongodb";
import { MongoClient } from "mongodb";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.Mongo_CONN_STRING);

let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
  conn_string = process.env.MONGO_CONN_STRING;
} else {
  throw new Error("MONGO_CONN_STRING is not set");
}

const mongoConnect = (cb: (result: any) => void) => {
  MongoClient.connect(conn_string)
    .then((client) => {
      console.log("connect");
      cb(client);
    })
    .catch((err) => {
      console.log(err);
    });
};

export default mongoConnect;
