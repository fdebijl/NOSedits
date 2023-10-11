import { BskyAgent, AppBskyFeedPost } from '@atproto/api'
import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { CONFIG } from '../config';
import { SeenArticle, Article, PersistedBlueSkyRecord } from '../types';
import { addSkeetToArticle } from '../db';

const clog = new Clog();
export const agent = new BskyAgent({ service: 'https://bsky.social' });

(async () => {
  await agent.login({ identifier: CONFIG.BLUESKY.IDENTIFIER, password: CONFIG.BLUESKY.PASSWORD });
  clog.log(`Logged in to BlueSky as ${CONFIG.BLUESKY.IDENTIFIER}`, LOGLEVEL.DEBUG);
})();

export const sendSkeet = async (collection: Collection<SeenArticle>, status: Omit<AppBskyFeedPost.Record, 'createdAt'>, article: Article, seenArticle?: SeenArticle): Promise<void> => {
  try {
    const persistedIdentifiers = await agent.post(status);
    const skeetResult: PersistedBlueSkyRecord = {
      ...status as AppBskyFeedPost.Record,
      ...persistedIdentifiers
    }

    clog.log(`Sent out a skeet: ${status.text}`, LOGLEVEL.DEBUG);

    if (seenArticle) {
      await addSkeetToArticle(collection, skeetResult, article);
    }
  } catch (error) {
    clog.log('Error while sending skeet:', LOGLEVEL.ERROR);
    clog.log(error, LOGLEVEL.ERROR);
  }
}

