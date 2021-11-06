import { Collection } from 'mongodb';
import { Article, SeenArticle } from '../types';

/**
 * Query the DB whether we've seen an article before
 */
export const getSeenArticle = async (collection: Collection, article: Article): Promise<SeenArticle | void> => {
  return new Promise((resolve, reject) => {
    collection.findOne({'org': article.org, 'articleId': article.articleID }, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (result) {
        resolve(result as SeenArticle);
      } else {
        resolve();
      }
    });
  });
};