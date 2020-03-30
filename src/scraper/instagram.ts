import Axios, { AxiosInstance } from 'axios';
import { HashtagResponse, Node } from './types';

export default class Instagram {
  private _TAG_URL = 'https://www.instagram.com/explore/tags/';
  private _httpClient: AxiosInstance;
  constructor() {
    this._httpClient = Axios.create({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4',
      },
    });
  }

  fetchUserMedia(username: string, amount: number) {}

  async fetchTagMedia(tag: string, amount: number): Promise<Node[]> {
    const nodes: Node[] = [];
    if (amount < 0) {
      throw new Error('Invalid amount passed');
    }

    try {
      const response = await this._httpClient.get(`${this._TAG_URL}${tag}`);
      const entryData = this._parseResponse(response.data).entry_data;
      const hashtagResponse: HashtagResponse =
        entryData?.TagPage[0]?.graphql?.hashtag?.edge_hashtag_to_media;
      if (!hashtagResponse.edges) {
        throw new Error('Unable to locate edges');
      }
      hashtagResponse.edges.forEach((n: Node) => nodes.push(n));

      // If we need to fetch more images, fetch via pagination.
      await this._getPaginatedTagMedia(tag, amount, nodes, hashtagResponse);
    } catch (e) {
      console.error(e);
    }

    return nodes;
  }

  private async _getPaginatedTagMedia(
    tag: string,
    amount: number,
    nodes: Node[],
    hashtagResponse: HashtagResponse
  ): Promise<void> {
    let hasNextPage = hashtagResponse.page_info.has_next_page;
    let maxId = hashtagResponse.page_info.end_cursor;
    let endpoint = `https://www.instagram.com/explore/tags/${tag}/?__a=1&max_id=${maxId}`;
    try {
      while (hasNextPage && nodes.length < amount) {
        const response = await this._httpClient.get(endpoint);
        const hashTagResponse: HashtagResponse =
          response.data.graphql?.hashtag?.edge_hashtag_to_media;
        if (!hashTagResponse.edges) {
          throw new Error('Unable to locate edges');
        }
        hashtagResponse.edges.forEach((n: Node) => nodes.push(n));

        hasNextPage = hashtagResponse.page_info.has_next_page;
        maxId = hashtagResponse.page_info.end_cursor;
        endpoint = `https://www.instagram.com/explore/tags/${tag}/?__a=1&max_id=${maxId}`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  private _parseResponse(html: string) {
    try {
      const data = html.match(/window\._sharedData\s?=\s?({.+);<\/script>/);
      if (!data || data.length === 0) {
        return {};
      }
      return JSON.parse(data[1]);
    } catch (e) {
      console.error(e);
      return {};
    }
  }
}
