import { mastodon } from 'masto';
import { Clog, LOGLEVEL} from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { Article, SeenArticle } from '../types';
import { getSeenArticle } from './getSeenArticle';

const clog = new Clog();

export const addTootToArticle = async (collection: Collection<SeenArticle>, status: mastodon.v1.Status, article: Article): Promise<void> => {
  const seenArticle = await getSeenArticle(collection, article);

  if (seenArticle) {
    const toots = seenArticle.toots;

    toots.push({
      status,
      newTitle: article.titles[article.titles.length - 1],
      oldTitle: article.titles[article.titles.length - 2]
    });

    try {
      await collection.updateOne({ org: article.org, articleId: article.articleID }, {$set: {'toots': toots}});
      clog.log(`Added toot to article ${article.org}:${article.articleID}, Toot length should now be ${toots.length}`, LOGLEVEL.DEBUG)
    } catch (error) {
      clog.log(error, LOGLEVEL.ERROR);
    }
  }
};
