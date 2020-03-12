import { MongoClient, Db } from 'mongodb';
import { CONFIG } from '../config'

export const connect = async (): Promise<{client: MongoClient; db: Db}> => {
  return new Promise((resolve, reject) => {
    const client = new MongoClient(CONFIG.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    client.connect((error) => {
      if (error) {
        reject(error);
        return;
      }

      const db = client.db();

      resolve({
        client,
        db
      });
    });
  });
}