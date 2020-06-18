import express from 'express';
import { Clog, LOGLEVEL } from '@fdebijl/clog';

import { CONFIG } from '../config';
import { notifyTitleChanged } from '../hooks/notifyTitleChanged';
import { connect } from '../db/connect';
import { initializeTwit } from '../twitter/initializeTwit';
import { Listener } from './Listener';

/**
 * @deprecated The WebhookListener does not guarantee ordered delivery, MessageQueueListener is heavily prefered
 */
export class WebhookListener implements Listener {
  init(): void {
    const app = express();

    (async (): Promise<void> => {
      app.use(express.json());

      const clog = new Clog(CONFIG.MIN_LOGLEVEL);

      if (!CONFIG.MONGO_URL) {
        throw new Error('MONGO_URL was not defined in environment variables, could not connect to database.');
      }

      const { db } = await connect(CONFIG.MONGO_URL);
      const T = await initializeTwit();
      const articleCollection = db.collection('articles');

      app.post('/notify', (req, res) => {
        if (typeof (req.body) != 'object') {
          req.body = JSON.parse(req.body);
        }

        notifyTitleChanged(req.body, T, articleCollection).then((status) => {
          res.status(200).send(status);
        }).catch((error) => {
          res.status(500).send(JSON.stringify(error, null, 4));
        });
      })

      app.listen(CONFIG.PORT, () => {
        clog.log(`NOSEdits is listening on ${CONFIG.PORT}`, LOGLEVEL.INFO);
      });
    })();
  }
}