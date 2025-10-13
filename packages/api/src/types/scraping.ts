export interface Article {
  url: string;
  headline?: string;
  articleBody?: string;
  datePublished?: string;
  datePublishedRaw?: string;
  mainImage?: {
    url?: string;
  };
  images?: {
    url?: string;
  }[];
  inLanguage?: string;
  metadata?: {
    probability?: number;
  };
}

export interface FetchedArticle extends Article {
  id: string;
}
