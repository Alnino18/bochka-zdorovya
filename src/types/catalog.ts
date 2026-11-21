export interface PriceOption {
  durationMinutes: number;
  priceUZS: number;
  priceFormatted: string;
  posterItem?: number;
}

export interface ServiceCategory {
  id: string;
  categoryNumber: number;
  nameRu: string;
  nameUz: string;
  descriptionRu?: string;
  descriptionUz?: string;
  posterItems?: number[];
  options: PriceOption[];
}

export interface BusinessContacts {
  nameRu?: string;
  nameUz?: string;
  phone: string;
  phoneFormatted: string;
  phoneTel: string;
  instagram: string;
  instagramUrl: string;
  phoneDisplay?: string;
  phoneFull?: string;
  phoneTelUri?: string;
  phoneLocalTelUri?: string;
  instagramHandle?: string;
}

export interface PosterRow {
  rowNumber: number;
  serviceRu: string;
  serviceUz: string;
  duration?: string;
  durationMinutes?: number;
  priceUZS?: number;
  priceFormatted?: string;
  optionsTextRu?: string;
  optionsTextUz?: string;
  variants?: Array<{ durationMinutes: number; priceUZS: number }>;
}

export interface PriceListData {
  business: BusinessContacts;
  categories: ServiceCategory[];
  posterRows?: PosterRow[];
}
