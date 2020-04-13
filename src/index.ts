import { PubSub } from '@google-cloud/pubsub';
import { defer, fromEvent } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';
import Instagram from './scraper/instagram';
import { Node } from './scraper/types';
import { Message } from './types';

const SCRAPE_SUBSCRIPTION =
  process.env.SCRAPE_SUBSCRIPTION || 'image_scraper_instagram_subscription';
const IMAGE_CLASSIFICATION_TOPIC =
  process.env.IMAGE_CLASSIFICATION_TOPIC || 'image_classification_topic';

const pubSubClient = new PubSub({ keyFile: './woofbot.json' });
const instagramClient = new Instagram();
const subscription = pubSubClient.subscription(SCRAPE_SUBSCRIPTION);
const messageEvent = fromEvent(subscription, 'message');

const handleMessage = () => {
  return tap((message: any) => {
    message.ack();
  });
};

const executeMessage = () => {
  return mergeMap((message: Message) => {
    return defer(async () => {
      const response: { scrapeType: string, nodes?: Node[] } = { scrapeType: message.attributes.scrapeType };

      if (message.attributes.scrapeType === 'profile') {
        response.nodes = await instagramClient.fetchUserMedia(
          message.attributes.scrapeValue,
          parseInt(message.attributes.scrapeAmount)
        );
      }

      response.nodes = await instagramClient.fetchTagMedia(
        message.attributes.scrapeValue,
        parseInt(message.attributes.scrapeAmount)
      );

      return response;
    });
  });
};

const filterMessage = () => {
  return filter((message: any) => {
    return (
      message.attributes.scrapeValue &&
      message.attributes.scrapeType &&
      message.attributes.scrapeAmount
    );
  });
};

messageEvent
  .pipe(handleMessage(), filterMessage(), executeMessage())
  .subscribe(async (result: { scrapeType: string, nodes?: Node[] }) => {
    const buffer = Buffer.from(JSON.stringify(result.nodes));
    await pubSubClient.topic(IMAGE_CLASSIFICATION_TOPIC).publish(buffer, {
      scrapeType: result.scrapeType
    });
  });
