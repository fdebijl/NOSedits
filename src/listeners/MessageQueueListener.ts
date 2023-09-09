import amqp from 'amqplib/callback_api';
import { Clog, LOGLEVEL } from '@fdebijl/clog';
import * as Sentry from '@sentry/node';

import { CONFIG } from '../config';
import { notifyTitleChanged } from '../hooks/notifyTitleChanged';
import { connect } from '../db/connect';
import { Listener } from './Listener';
import { SeenArticle } from '../types';

export class MessagequeueListener implements Listener {
  private clog: Clog;

  constructor() {
    this.clog = new Clog();
  }

  private async connectToMQ(): Promise<amqp.Channel> {
    return new Promise((resolve) => {
      if (!CONFIG.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL was not defined in the environment variables, could not connect to message exchange.');
      }

      this.clog.log(`Connecting to RabbitMQ at ${CONFIG.RABBITMQ_URL}`, LOGLEVEL.DEBUG);

      amqp.connect(CONFIG.RABBITMQ_URL, (error0, connection) => {
        if (error0) {
          this.clog.log(error0, LOGLEVEL.ERROR);
          throw error0;
        }

        connection.createChannel((error1, channel) => {
          if (error1) {
            this.clog.log(error1, LOGLEVEL.ERROR);
            throw error1;
          }

          this.clog.log('Succesfully created channel', LOGLEVEL.DEBUG);

          resolve(channel);
        });
      });
    });
  }

  async init(): Promise<void> {
    if (!CONFIG.MONGO_URL) {
      throw new Error('MONGO_URL was not defined in environment variables, could not connect to database.');
    }

    const channel: amqp.Channel = await this.connectToMQ();

    const { db } = await connect(CONFIG.MONGO_URL);
    const articleCollection = db.collection<SeenArticle>('articles');

    const exchange = 'opentitles';
    const key = 'nl.NOS'

    channel.assertExchange(exchange, 'topic', {
      durable: true
    }, (error2) => {
      if (error2) {
        this.clog.log(error2, LOGLEVEL.ERROR);
        throw error2;
      }

      this.clog.log(`Successfully asserted exchange ${exchange}`, LOGLEVEL.DEBUG);
    });

    channel.assertQueue('', {
      exclusive: true
    }, (error3, q) => {
      if (error3) {
        this.clog.log(error3, LOGLEVEL.ERROR);
        throw error3;
      }

      if (!channel) {
        this.clog.log('Channel was undefined at runtime!', LOGLEVEL.FATAL);
        return;
      }

      this.clog.log(`NOSEdits is listening on exchange ${exchange} with key ${key}`, LOGLEVEL.INFO);

      channel.bindQueue(q.queue, exchange, key);

      channel.consume(q.queue, (msg) => {
        if (!msg) {
          return;
        }

        const payload = JSON.parse(msg.content.toString());
        notifyTitleChanged(payload,articleCollection).then(() => {
          // Ack here
        }).catch((err) => {
          Sentry.captureException(err);
        })
      }, {
        noAck: true
      });
    });
  }
}
