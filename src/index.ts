import express from 'express';
import { Clog, LOGLEVEL } from '@fdebijl/clog';

import { CONFIG } from './config';
import { notifyTitleChanged } from './hooks/notifyTitleChanged';
import { connect } from './db/connect';
import { initializeTwit } from './twitter/initializeTwit';


const app = express();

(async (): Promise<void> => {
  app.use(express.json());

  const clog = new Clog(CONFIG.MIN_LOGLEVEL);

  const { db } = await connect();
  const T = await initializeTwit();
  const articleCollection = db.collection('articles');

  app.post('/notify', (req, res) => {
    if (typeof (req.body) != 'object') {
      req.body = JSON.parse(req.body);
    }

    res.status(200).send(notifyTitleChanged(req.body, T, articleCollection));
  })

  app.listen(CONFIG.PORT, () => {
    clog.log(`NOSEdits is listening on ${CONFIG.PORT}`, LOGLEVEL.INFO);
  });
})();
