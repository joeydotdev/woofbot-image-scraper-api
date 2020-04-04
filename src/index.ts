import Instagram from "./scraper/instagram";
import { PubSub } from "@google-cloud/pubsub";
import { fromEvent, defer } from "rxjs";
import { map, mergeMap, tap, filter } from "rxjs/operators";
import { Message } from "./types";
import { Node } from "./scraper/types";

const SCRAPE_SUBSCRIPTION = process.env.SCRAPE_SUBSCRIPTION ||
  "image_scraper_instagram_subscription";
const IMAGE_CLASSIFICATION_TOPIC = process.env.IMAGE_CLASSIFICATION_TOPIC ||
  "image_classification_topic";

const pubSubClient = new PubSub({ keyFile: "./woofbot.json" });
const instagramClient = new Instagram();
const subscription = pubSubClient.subscription(SCRAPE_SUBSCRIPTION);
const messageEvent = fromEvent(subscription, "message");

const handleMessage = () => {
  return tap((message: any) => {
    message.ack();
  });
};

const executeMessage = () => {
  return mergeMap((message: Message) => {
    return defer(async () => {
      if (message.attributes.scrapeType === "profile") {
        return await instagramClient.fetchUserMedia(
          message.attributes.scrapeValue,
          parseInt(message.attributes.scrapeAmount)
        );
      }
      return await instagramClient.fetchTagMedia(
        message.attributes.scrapeValue,
        parseInt(message.attributes.scrapeAmount)
      );
    });
  });
};

const filterMessage = () => {
  return filter((message: any) => {
    return message.attributes.scrapeValue &&
      message.attributes.scrapeType &&
      message.attributes.scrapeAmount;
  }
  );
};

messageEvent
  .pipe(
    handleMessage(),
    filterMessage(),
    executeMessage()
  )
  .subscribe(async (result: Node[]) => {
    const buffer = Buffer.from(JSON.stringify(result));
    await pubSubClient.topic(IMAGE_CLASSIFICATION_TOPIC).publish(buffer);
  });
