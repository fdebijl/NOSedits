import { mastodon, createRestAPIClient } from 'masto';
import { Collection } from 'mongodb';
import { Clog, LOGLEVEL } from '@fdebijl/clog';

import { CONFIG } from '../config';
import { SeenArticle, Article } from '../types';
import { addTootToArticle } from '../db';

const clog = new Clog();
const client = createRestAPIClient({
  url: CONFIG.MASTODON.API_URL,
  accessToken: CONFIG.MASTODON.ACCESS_TOKEN
});

if (client) {
  clog.log('Logged in to Mastodon', LOGLEVEL.DEBUG);
}

export const sendToot = async (collection: Collection<SeenArticle>, payload: mastodon.rest.v1.CreateStatusParams, article: Article, seenArticle?: SeenArticle): Promise<void> => {
  try {
    const tootResult = await client.v1.statuses.create(payload);

    clog.log(`Sent out a toot: ${payload.status}`, LOGLEVEL.DEBUG);

    if (seenArticle) {
      await addTootToArticle(collection, tootResult, article);
    }
  } catch (error) {
    clog.log('Error while sending toot:', LOGLEVEL.ERROR);
    clog.log(error, LOGLEVEL.ERROR);
  }
}
