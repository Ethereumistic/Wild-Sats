import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const options = {};

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db: Db = client.db("wildsats");
  const users: Collection = db.collection("users");
  return { client, db, users };
}