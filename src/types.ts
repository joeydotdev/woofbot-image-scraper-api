import { Message as GoogleMessage } from '@google-cloud/pubsub';

export type Message = GoogleMessage & {
  attributes: {
    scrapeValue: string;
    scrapeAmount: string;
    scrapeType: string;
  };
};
