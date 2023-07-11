export interface Episode {
  id?: number;
  link: string;
  description: string;
  pubDate: string;
  torrent: string;
  previewed?: boolean;
  confirmed?: boolean;
  downloaded?: boolean;
  filePath?: string;
  name?: string;
  nameRaw?: string;
  nameAlias?: string;
}

export interface Anime {
  id?: number;
  name: string;
  nameRaw?: string;
  nameAlias?: string;
  count?: string;
  startDate?: string;
  dayOfWeek?: string;
  bgmId?: string;
  img: string;
  sourceId: string;
  sourceSite: string;
  publishGroupId: string;
  publishGroupName: string;
  subGroup?: SubGroup[];
  episode?: Episode[];
}

export interface SubGroup {
  id?: number;
  sourceId: string;
  name: string;
}