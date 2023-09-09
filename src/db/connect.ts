import { MongoClient, Db } from 'mongodb';

let _client: MongoClient;
let _db: Db;

export const connect = async (mongoUrl: string): Promise<{client: MongoClient; db: Db}> => {
  if (_client && _db) {
    return {
      client: _client,
      db: _db
    };
  }

  const client = new MongoClient(mongoUrl, {
    appName: 'NOSEdits'
  });

  _client = await client.connect();
  _db = _client.db();

  return {
    client: _client,
    db: _db
  }
}
