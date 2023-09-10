import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { Article, PostError as ERR, SeenArticle } from '../types';
import { getSeenArticle } from '../db/getSeenArticle';

const clog = new Clog();

export const doublePostGuard = async (collection: Collection<SeenArticle>, article: Article, platform: 'twitter' | 'mastodon' | 'bluesky'): Promise<void> => {
  const seenArticle = await getSeenArticle(collection, article);

  if (seenArticle) {
    const key = platform === 'twitter' ? 'tweets' : platform === 'mastodon' ? 'toots' : 'skeets';
    const posts = seenArticle[key];

    if (posts.length === 0) {
      return;
    }

    if (
      posts[posts.length - 1].oldTitle.title === article.titles[article.titles.length - 2].title &&
      posts[posts.length - 1].newTitle.title === article.titles[article.titles.length - 1].title
    ) {
      clog.log(ERR.ALREADY_POSTED.message, LOGLEVEL.ERROR);
      throw ERR.ALREADY_POSTED;
    }
  }
}
