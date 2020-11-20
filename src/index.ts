import { Clog, LOGLEVEL } from '@fdebijl/clog';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import { CONFIG } from './config';

if (process.env.DSN) {
  Sentry.init({ dsn: process.env.DSN });
}

if (CONFIG.HEARTBEAT_URL) {
  setInterval(() => {
    fetch(CONFIG.HEARTBEAT_URL)
  }, 30 * 1000)
}

import { ListenerType } from './listeners/ListenerType';
import { Listener } from './listeners/Listener';
import { MessagequeueListener } from './listeners/MessageQueueListener';
import { WebhookListener } from './listeners/WebhookListener';

let listener: Listener;

const clog = new Clog(CONFIG.MIN_LOGLEVEL);

switch (CONFIG.LISTENER) {
  case ListenerType.MessageQueue: {
    listener = new MessagequeueListener();
    break;
  }
  case ListenerType.Webhook: {
    listener = new WebhookListener();
    clog.log(`DEPRECATION WARNING: The WebhookListener is deprecated, the MessageQueueListener should be used wherever possible.`, LOGLEVEL.WARN);
    break;
  }
  default: {
    listener = new WebhookListener();
    clog.log(`DEPRECATION WARNING: The WebhookListener is deprecated, the MessageQueueListener should be used wherever possible. Set environment var 'LISTENER' to 'mq' to enable the MessageQueueListener.`, LOGLEVEL.WARN);
    break;
  }
}

listener.init();
