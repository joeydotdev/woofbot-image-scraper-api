import Axios, { AxiosInstance } from 'axios';
import { MediaResponse, Node, UserResponse, ProfilePayload } from './types';

export default class Instagram {
  private _TAG_URL = 'https://www.instagram.com/explore/tags/';
  private _BASE_URL = 'https://www.instagram.com/';
  private _httpClient: AxiosInstance;
  constructor() {
    this._httpClient = Axios.create({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4',
      },
    });
  }

  async fetchUserMedia(username: string, amount: number): Promise<Node[]> {
    const nodes: Node[] = [];
    try {
      const response = await this._httpClient.get(`${this._BASE_URL}${username}`);
      const entryData = this._parseResponse(response.data).entry_data;
      const userResponse: UserResponse = entryData?.ProfilePage[0]?.graphql?.user;
      const mediaResponse: MediaResponse = userResponse?.edge_owner_to_timeline_media;

      if (!mediaResponse.edges) {
        throw new Error('Unable to locate edges');
      }
      mediaResponse.edges.forEach((n: Node) => nodes.push(n));

      const payload = {
        id: userResponse.id,
        first: nodes.length.toString(),
        after: mediaResponse.page_info.end_cursor,
      };

      await this._getPaginatedMedia(payload, amount, nodes, mediaResponse);
    } catch (e) {
      console.error(e);
    }
    return nodes;
  }

  async fetchTagMedia(tag: string, amount: number): Promise<Node[]> {
    const nodes: Node[] = [];
    if (amount < 0) {
      throw new Error('Invalid amount passed');
    }

    try {
      const response = await this._httpClient.get(`${this._TAG_URL}${tag}`);
      const entryData = this._parseResponse(response.data).entry_data;
      const mediaResponse: MediaResponse =
        entryData?.TagPage[0]?.graphql?.hashtag?.edge_hashtag_to_media;
      if (!mediaResponse.edges) {
        throw new Error('Unable to locate edges');
      }
      mediaResponse.edges.forEach((n: Node) => nodes.push(n));

      // If we need to fetch more images, fetch via pagination.
      await this._getPaginatedMedia(tag, amount, nodes, mediaResponse);
    } catch (e) {
      console.error(e);
    }

    return nodes;
  }

  private async _getPaginatedMedia(
    value: string | ProfilePayload,
    amount: number,
    nodes: Node[],
    mediaResponse: MediaResponse,
  ): Promise<void> {
    let hasNextPage = mediaResponse.page_info.has_next_page;
    let maxId = mediaResponse.page_info.end_cursor;
    let endpoint = this._buildQueryUrl(value, maxId);
    try {
      while (hasNextPage && nodes.length < amount) {
        console.log(`Fetched pictures: ${nodes.length}/${amount}`);
        const response = await this._httpClient.get(endpoint);
        let mediaResponse = response.data.data?.user?.edge_owner_to_timeline_media;
        if (typeof value === 'string') {
          mediaResponse =
            response.data.graphql?.hashtag?.edge_hashtag_to_media;
        }

        if (!mediaResponse.edges) {
          throw new Error('Unable to locate edges');
        }

        mediaResponse.edges.forEach((n: Node) => nodes.push(n));
        hasNextPage = mediaResponse.page_info.has_next_page;
        maxId = mediaResponse.page_info.end_cursor;

        if (typeof value !== 'string') {
          value = {
            id: value.id,
            first: nodes.length.toString(),
            after: maxId,
          };
        }
        endpoint = this._buildQueryUrl(value, maxId);
      }
    } catch (e) {
      console.error(e);
    }
    console.log(`Fetched pictures: ${nodes.length}/${amount}`);
  }

  private _parseResponse(html: string) {
    try {
      const data = html.match(/window\._sharedData\s?=\s?({.+);<\/script>/) || [];
      if (data.length === 0) {
        throw new Error('Unable to parse page');
      }
      return JSON.parse(data[1]);
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  private _buildQueryUrl(value: string | ProfilePayload, maxId: string) {
    if (typeof value !== 'string') {
      return `https://www.instagram.com/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables=${encodeURIComponent(
        JSON.stringify(value)
      )}`;
    }
    return `https://www.instagram.com/explore/tags/${value}/?__a=1&max_id=${maxId}`;
  }
}
