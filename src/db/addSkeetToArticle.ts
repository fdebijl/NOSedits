import { Clog, LOGLEVEL} from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { Article, PersistedBlueSkyRecord, SeenArticle } from '../types';
import { getSeenArticle } from './getSeenArticle';

const clog = new Clog();

export const addSkeetToArticle = async (collection: Collection<SeenArticle>, status: PersistedBlueSkyRecord, article: Article): Promise<void> => {
  const seenArticle = await getSeenArticle(collection, article);

  if (seenArticle) {
    const skeets = seenArticle.skeets

    skeets.push({
      status,
      newTitle: article.titles[article.titles.length - 1],
      oldTitle: article.titles[article.titles.length - 2]
    });

    try {
      await collection.updateOne({ org: article.org, articleId: article.articleID }, {$set: {'skeets': skeets}});
      clog.log(`Added skeet to article ${article.org}:${article.articleID}, Skeet length should now be ${skeets.length}`, LOGLEVEL.DEBUG)
    } catch (error) {
      clog.log(error, LOGLEVEL.ERROR);
    }
  }
};
