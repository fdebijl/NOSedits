import { MongoClient, Db } from 'mongodb';

export const connect = async (mongoUrl: string): Promise<{client: MongoClient; db: Db}> => {
  return new Promise((resolve, reject) => {
    const client = new MongoClient(mongoUrl, {
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