import { getDifferenceBetweenTimestamps } from './time/getDifferenceBetweenTimestamps';
import { Article } from '../types';

export const makeStatusText = async (article: Article): Promise<string> => {
  const oldtitle = article.titles[article.titles.length - 2];
  const newtitle = article.titles[article.titles.length - 1];
  const delay: string = await getDifferenceBetweenTimestamps(oldtitle.timestamp, newtitle.timestamp);

  return `De kop «${oldtitle.title}» is ${delay}gewijzigd naar «${newtitle.title}» ${article.guid || article.link}`;
}