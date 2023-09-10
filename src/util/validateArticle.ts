import { Clog, LOGLEVEL } from '@fdebijl/clog';

import { Article, PostError as ERR, PostError } from '../types';

export const articleHasErrors = (article: Article): PostError | undefined => {
  const clog = new Clog();

  if (article.titles.length < 2) {
    clog.log(ERR.NOT_ENOUGH_TITLES.message, LOGLEVEL.ERROR);
    return ERR.NOT_ENOUGH_TITLES
  }

  if (article.titles[article.titles.length - 2].title === article.titles[article.titles.length - 1].title) {
    clog.log(ERR.NO_DIFFERENCE.message, LOGLEVEL.ERROR);
    return ERR.NO_DIFFERENCE;
  }

  let lastTimestamp = article.titles[0].timestamp;
  article.titles.forEach((title) => {
    if (title.timestamp < lastTimestamp) {
      return ERR.NOT_CHRONOLOGICAL;
    }

    lastTimestamp = title.timestamp;
  });
}
