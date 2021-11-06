import { Collection } from 'mongodb';
import { SeenArticle } from '../types';

/**
 * Query the DB whether we've seen an article before
 */
export const insertSeenArticle = async (collection: Collection, seenArticle: SeenArticle): Promise<SeenArticle | void> => {
  return new Promise((resolve, reject) => {
    collection.insertOne(seenArticle, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};