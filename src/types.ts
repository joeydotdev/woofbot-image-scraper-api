import { Message as GoogleMessage } from "@google-cloud/pubsub";

export interface Message extends GoogleMessage {
  attributes: {
    scrapeValue: string;
    scrapeAmount: string;
    scrapeType: string;
  }
}