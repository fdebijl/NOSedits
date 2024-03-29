import { Collection } from 'mongodb';
import { Clog, LOGLEVEL } from '@fdebijl/clog';

import { Article, SeenArticle, PostError } from '../types';
import { makeStatusText } from '../util';
import { postToAllPlatforms } from '../social';

const clog = new Clog();

/**
 * Validates an incoming article from OpenTitles and posts to all connected platforms if all the data is congruent.
 *
 * @param {Article} article An article for the NOS as generated by the OpenTitles API.
 * @returns {Promise} Resolves with the text of the sent posts if everything went smoothly, rejects with an instance of ERR if an error occurred or the data was invalid.
 */
export const notifyTitleChanged = async (article: Article, collection: Collection<SeenArticle>): Promise<PostError | string> => {
  try {
    const text = await makeStatusText(article);
    await postToAllPlatforms(article, collection, text);
    return text;
  } catch (error) {
    clog.log('Error while notifying title change', LOGLEVEL.ERROR);
    clog.log(error, LOGLEVEL.ERROR);
    return error as PostError;
  }
}
