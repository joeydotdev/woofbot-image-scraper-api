export type Node = {
  comments_disabled: boolean;
  __typename: 'GraphImage' | 'Something';
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
  edge_liked_by: {
    count: number;
  };
  edge_media_preview_like: {
    count: number;
  };
  owner: {
    id: string;
  };
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

export type HashtagResponse = {
  count: number;
  page_info: {
    has_next_page: boolean;
    end_cursor: string;
  };
  edges: Node[];
};
