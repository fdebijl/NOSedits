import { CONFIG } from './config';
import { ListenerType } from './listeners/ListenerType';
import { Listener } from './listeners/Listener';
import { MessagequeueListener } from './listeners/MessageQueueListener';
import { WebhookListener } from './listeners/webhooklistener';

let listener: Listener;

switch (CONFIG.LISTENER) {
  case ListenerType.MessageQueue: {
    listener = new MessagequeueListener();
    break;
  }
  case ListenerType.Webhook: {
    listener = new WebhookListener();
    console.log(`DEPRECATION WARNING: The WebhookListener is deprecated, the MessageQueueListener should be used wherever possible.`);
    break;
  }
  default: {
    listener = new WebhookListener();
    console.log(`DEPRECATION WARNING: The WebhookListener is deprecated, the MessageQueueListener should be used wherever possible. Set environment var 'LISTENER' to 'mq' to enable the MessageQueueListener.`);
    break;
  }
}

listener.init();