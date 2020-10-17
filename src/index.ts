import { PubSub } from '@google-cloud/pubsub';
import { fromEvent } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
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
const message$ = fromEvent<Message>(subscription, 'message');

message$
  .pipe(
    tap((message) => message.ack()),
    mergeMap(async (message: Message) => ({
      scrapeType: message.attributes.scrapeType,
      nodes:
        message.attributes.scrapeType === 'profile'
          ? await instagramClient.fetchUserMedia(
              message.attributes.scrapeValue,
              parseInt(message.attributes.scrapeAmount)
            )
          : await instagramClient.fetchTagMedia(
              message.attributes.scrapeValue,
              parseInt(message.attributes.scrapeAmount)
            ),
    }))
  )
  .subscribe(async (result: { scrapeType: string; nodes?: Node[] }) => {
    const buffer = Buffer.from(JSON.stringify(result.nodes));
    await pubSubClient.topic(IMAGE_CLASSIFICATION_TOPIC).publish(buffer, {
      scrapeType: result.scrapeType,
    });
  });
