import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

await client.connect();

const db = client.db("scora");

const users = db.collection("users");
const matches = db.collection("matches");
const players = db.collection("players");

//Create a compound unique index once for matches
matches.createIndex({ normalizedKey: 1 }, { unique: true });

export { users, matches, players };
