import { Collection, InsertOneResult } from 'mongodb';
import { SeenArticle } from '../types';

/**
 * Query the DB whether we've seen an article before
 */
export const insertSeenArticle = async (collection: Collection<SeenArticle>, seenArticle: SeenArticle): Promise<InsertOneResult<SeenArticle>> => {
  return collection.insertOne(seenArticle);
};
