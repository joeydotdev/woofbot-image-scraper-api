export type Node = {
  comments_disabled: boolean;
  __typename: 'GraphImage' | 'GraphSidecar' | 'GraphVideo';
  id: string;
  shortcode: string;
  edge_media_to_comment: {
    count: number;
  };
  taken_at_timestamp: number;
  dimensions: {
    height: number;
    width: number;
  };
  display_url: string;
  edge_liked_by: Count;
  edge_media_preview_like: Count;
  owner: {
    id: string;
    username?: string;
  };
  location?: Object;
  thumbnail_src: string;
  thumbnail_resources: Thumbnail[];
  is_video: boolean;
  accessibility_caption: string;
  video_view_count?: number;
  edge_media_to_caption?: Object;
  edge_hashtag_to_top_posts?: Object;
  edge_hashtag_to_content_advisory?: Object;
  edge_hashtag_to_related_tags?: Object;
  edge_hashtag_to_null_state?: Object;
};

type Thumbnail = {
  src: string;
  config_width: number;
  config_height: number;
};

export enum ScrapeType {
  TAG = 'tag',
  USER = 'user',
}

export type MediaResponse = {
  count: number;
  page_info: {
    has_next_page: boolean;
    end_cursor: string;
  };
  edges: Node[];
};

export type Count = {
  count: number;
};

export type UserResponse = {
  blocked_by_viewer: boolean;
  restricted_by_viewer?: any;
  country_block: boolean;
  external_url?: any;
  external_url_linkshimmed?: any;
  edge_followed_by: Count;
  followed_by_viewer: boolean;
  edge_follow: Count;
  follows_viewer: boolean;
  full_name: string;
  has_ar_effects: boolean;
  has_channel: boolean;
  has_blocked_viewer: boolean;
  highlight_reel_count: number;
  has_requested_viewer: boolean;
  id: string;
  is_business_account: boolean;
  is_joined_recently: boolean;
  business_category_name: string;
  category_id: string;
  overall_category_name?: any;
  is_private: boolean;
  is_verified: boolean;
  edge_owner_to_timeline_media: MediaResponse;
};

export type UserVariables = {
  id: string;
  first: string;
  after: string;
};
