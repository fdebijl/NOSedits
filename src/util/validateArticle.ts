import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { Article, TwitterError as ERR, SeenArticle } from '../types';
import { getSeenArticle } from '../db/getSeenArticle';

export const validateArticle = (collection: Collection<SeenArticle>, article: Article): Promise<SeenArticle | null> => {
return new Promise((resolve, reject) => {
    const clog = new Clog();

    debugger;

    if (article.titles.length < 2) {
      clog.log(ERR.NOT_ENOUGH_TITLES.message, LOGLEVEL.ERROR);
      reject(ERR.NOT_ENOUGH_TITLES);
      return;
    }

    if (article.titles[article.titles.length - 2].title === article.titles[article.titles.length - 1].title) {
      clog.log(ERR.NO_DIFFERENCE.message, LOGLEVEL.ERROR);
      reject(ERR.NO_DIFFERENCE);
      return;
    }

    let lastTimestamp = article.titles[0].timestamp;
    article.titles.forEach((title) => {
      if (title.timestamp < lastTimestamp) {
        reject(ERR.NOT_CHRONOLOGICAL);
      }

      lastTimestamp = title.timestamp;
    });

    getSeenArticle(collection, article).then((seenArticle) => {
      if (seenArticle) {
        if (
          seenArticle.tweets[seenArticle.tweets.length - 1].oldTitle.title === article.titles[article.titles.length - 2].title &&
          seenArticle.tweets[seenArticle.tweets.length - 1].newTitle.title === article.titles[article.titles.length - 1].title
        ) {
          clog.log(ERR.ALREADY_TWEETED.message, LOGLEVEL.ERROR);
          reject(ERR.ALREADY_TWEETED);
          return;
        }
      }

      resolve(seenArticle as SeenArticle);
    })
  });
}
