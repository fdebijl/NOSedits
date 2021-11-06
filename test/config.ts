import { LOGLEVEL } from '@fdebijl/clog';

export const CONFIG = {
  MIN_LOGLEVEL: LOGLEVEL.DEBUG,
  MONGO_URL: 'mongodb://localhost:27017/nosedits-tests',
  MOMENT: {
    LOCALE: 'nl'
  },
  PORT: 7676
}