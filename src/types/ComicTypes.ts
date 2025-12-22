export interface ComicSeries {
  rank: number;
  series_name: string;
  publisher: string;
  writer: string;
  artists: string[];
  colorists: string[];
  letterers: string[];
  cover_image: string;
  sample_images: string[];
  description: string;
  description_source?: {
    name: string;
    link: string;
  };
  jj_comment?: string;  
  link: string;
}