import { MongoClient, Db } from 'mongodb';

export const connect = async (mongoUrl: string): Promise<{client: MongoClient; db: Db}> => {
  return new Promise((resolve, reject) => {
    const client = new MongoClient(mongoUrl, {
      appName: 'NOSEdits'
    });

    client.connect((error) => {
      if (error) {
        reject(error);
        return;
      }

      const db = client.db('noseditstest');

      resolve({
        client,
        db
      });
    });
  });
}