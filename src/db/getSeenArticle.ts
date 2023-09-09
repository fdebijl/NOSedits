import { Collection } from 'mongodb';
import { Article, SeenArticle } from '../types';

/**
 * Query the DB whether we've seen an article before
 */
export const getSeenArticle = async (collection: Collection<SeenArticle>, article: Article): Promise<SeenArticle | null> => {
  return collection.findOne({'org': article.org, 'articleId': article.articleID });
}
