import { BusinessContacts, PosterRow, PriceListData, ServiceCategory } from '../types/catalog';

/**
 * Authoritative Business Contact Details for "Бочка Здоровья"
 */
export const BUSINESS_CONTACTS: BusinessContacts = {
  nameRu: 'Бочка Здоровья',
  nameUz: 'Bochka Zdorovya',
  phone: '97 002-04-04',
  phoneFormatted: '+998 97 002-04-04',
  phoneTel: 'tel:+998970020404',
  instagram: '@Bochka_zdorovya',
  instagramUrl: 'https://instagram.com/Bochka_zdorovya',
  phoneDisplay: '97 002-04-04',
  phoneFull: '+998 97 002-04-04',
  phoneTelUri: 'tel:+998970020404',
  phoneLocalTelUri: 'tel:970020404',
  instagramHandle: '@Bochka_zdorovya',
};

/**
 * Authoritative 8 Service Categories covering all 10 duration/price combinations in UZS
 * Matching priceListData.json
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-1',
    categoryNumber: 1,
    posterItems: [1, 2],
    nameRu: 'Фитобочка, Сауна, Массаж (оздоровительный)',
    nameUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
    descriptionRu: 'Комплексный оздоровительный сеанс: распаривание в кедровой фитобочке, сауна и классический оздоровительный массаж.',
    descriptionUz: "Keng qamrovli sog'lomlashtirish seansi: sadr fitobochkada bug'lanish, sauna va klassik sog'lomlashtiruvchi massaj.",
    options: [
      {
        posterItem: 1,
        durationMinutes: 40,
        priceUZS: 300000,
        priceFormatted: '300 000 UZS',
      },
      {
        posterItem: 2,
        durationMinutes: 60,
        priceUZS: 320000,
        priceFormatted: '320 000 UZS',
      },
    ],
  },
  {
    id: 'cat-2',
    categoryNumber: 2,
    posterItems: [3, 4],
    nameRu: 'Фитобочка, Сауна, Массаж (медовый)',
    nameUz: 'Fitobochka, Sauna, Massaj (asalli)',
    descriptionRu: 'Очищающий и тонизирующий спа-комплекс с натуральным медом, сауной и фитобочкой.',
    descriptionUz: 'Tabiiy asal, sauna va fitobochka yordamida tozalovchi va tetiklashtiruvchi spa-kompleks.',
    options: [
      {
        posterItem: 3,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 4,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-3',
    categoryNumber: 3,
    posterItems: [5],
    nameRu: 'Фитобочка, Сауна, Пилинг',
    nameUz: 'Fitobochka, Sauna, Piling',
    descriptionRu: 'Глубокое очищение и отшелушивание кожи в сочетании с фитобочкой и финской сауной.',
    descriptionUz: "Fitobochka va fin saunasi bilan birgalikda terini chuqur tozalash va o'lik hujayralarni yo'qotish.",
    options: [
      {
        posterItem: 5,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-4',
    categoryNumber: 4,
    posterItems: [6],
    nameRu: 'Арома массаж',
    nameUz: 'Aroma massaj',
    descriptionRu: 'Расслабляющий массаж с натуральными ароматическими и эфирными маслами для снятия стресса.',
    descriptionUz: "Stressni yengillashtirish uchun tabiiy xushbo'y va efir moylari bilan tinchlantiruvchi massaj.",
    options: [
      {
        posterItem: 6,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 6,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-5',
    categoryNumber: 5,
    posterItems: [7],
    nameRu: 'Точечный массаж',
    nameUz: 'Nuqtali massaj',
    descriptionRu: 'Акупрессурный массаж биоактивных точек тела для восстановления энергетики и баланса организма.',
    descriptionUz: 'Organizmning energiya va muvozanatini tiklash uchun biofaol nuqtalarga akupressura massaji.',
    options: [
      {
        posterItem: 7,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 7,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-6',
    categoryNumber: 6,
    posterItems: [8],
    nameRu: 'Лечебный массаж',
    nameUz: 'Davolovchi massaj',
    descriptionRu: 'Терапевтический массаж для снятия мышечных спазмов, устранения болей в спине и суставах.',
    descriptionUz: "Mushak spazmlarini yechish, bel va bo'g'im og'riqlarini davolash uchun terapevtik massaj.",
    options: [
      {
        posterItem: 8,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 8,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-7',
    categoryNumber: 7,
    posterItems: [9],
    nameRu: 'Хиромассаж',
    nameUz: 'Xiromassaj',
    descriptionRu: 'Испанская техника мануального хиромассажа, гармонизирующая нервную систему и кровообращение.',
    descriptionUz: "Asab tizimi va qon aylanishini uyg'unlashtiruvchi ispan qo'l xiromassaj texnikasi.",
    options: [
      {
        posterItem: 9,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 9,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
  {
    id: 'cat-8',
    categoryNumber: 8,
    posterItems: [10],
    nameRu: 'Комбинированный массаж',
    nameUz: 'Kombinatsiyalangan massaj',
    descriptionRu: 'Индивидуально подобранное сочетание нескольких массажных методик для максимального оздоровительного эффекта.',
    descriptionUz: "Maksimal sog'lomlashtirish samarasi uchun bir nechta massaj usullarining shaxsiy kombinatsiyasi.",
    options: [
      {
        posterItem: 10,
        durationMinutes: 40,
        priceUZS: 350000,
        priceFormatted: '350 000 UZS',
      },
      {
        posterItem: 10,
        durationMinutes: 60,
        priceUZS: 400000,
        priceFormatted: '400 000 UZS',
      },
    ],
  },
];

/**
 * Authoritative 10 Poster Rows from the original salon price poster
 */
export const POSTER_ROWS: PosterRow[] = [
  {
    rowNumber: 1,
    serviceRu: 'Фитобочка, Сауна, Массаж (оздоровительный)',
    serviceUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
    duration: '40 мин',
    durationMinutes: 40,
    priceUZS: 300000,
    priceFormatted: '300 000 UZS',
  },
  {
    rowNumber: 2,
    serviceRu: 'Фитобочка, Сауна, Массаж (оздоровительный)',
    serviceUz: "Fitobochka, Sauna, Massaj (sog'lomlashtiruvchi)",
    duration: '60 мин',
    durationMinutes: 60,
    priceUZS: 320000,
    priceFormatted: '320 000 UZS',
  },
  {
    rowNumber: 3,
    serviceRu: 'Фитобочка, Сауна, Массаж (медовый)',
    serviceUz: 'Fitobochka, Sauna, Massaj (asalli)',
    duration: '40 мин',
    durationMinutes: 40,
    priceUZS: 350000,
    priceFormatted: '350 000 UZS',
  },
  {
    rowNumber: 4,
    serviceRu: 'Фитобочка, Сауна, Массаж (медовый)',
    serviceUz: 'Fitobochka, Sauna, Massaj (asalli)',
    duration: '60 мин',
    durationMinutes: 60,
    priceUZS: 400000,
    priceFormatted: '400 000 UZS',
  },
  {
    rowNumber: 5,
    serviceRu: 'Фитобочка, Сауна, Пилинг',
    serviceUz: 'Fitobochka, Sauna, Piling',
    duration: '60 мин',
    durationMinutes: 60,
    priceUZS: 400000,
    priceFormatted: '400 000 UZS',
  },
  {
    rowNumber: 6,
    serviceRu: 'Арома массаж',
    serviceUz: 'Aroma massaj',
    optionsTextRu: '40 мин: 350 000 сум / 60 мин: 400 000 сум',
    optionsTextUz: "40 daq: 350 000 so'm / 60 daq: 400 000 so'm",
    variants: [
      { durationMinutes: 40, priceUZS: 350000 },
      { durationMinutes: 60, priceUZS: 400000 },
    ],
  },
  {
    rowNumber: 7,
    serviceRu: 'Точечный массаж',
    serviceUz: 'Nuqtali massaj',
    optionsTextRu: '40 мин: 350 000 сум / 60 мин: 400 000 сум',
    optionsTextUz: "40 daq: 350 000 so'm / 60 daq: 400 000 so'm",
    variants: [
      { durationMinutes: 40, priceUZS: 350000 },
      { durationMinutes: 60, priceUZS: 400000 },
    ],
  },
  {
    rowNumber: 8,
    serviceRu: 'Лечебный массаж',
    serviceUz: 'Davolovchi massaj',
    optionsTextRu: '40 мин: 350 000 сум / 60 мин: 400 000 сум',
    optionsTextUz: "40 daq: 350 000 so'm / 60 daq: 400 000 so'm",
    variants: [
      { durationMinutes: 40, priceUZS: 350000 },
      { durationMinutes: 60, priceUZS: 400000 },
    ],
  },
  {
    rowNumber: 9,
    serviceRu: 'Хиромассаж',
    serviceUz: 'Xiromassaj',
    optionsTextRu: '40 мин: 350 000 сум / 60 мин: 400 000 сум',
    optionsTextUz: "40 daq: 350 000 so'm / 60 daq: 400 000 so'm",
    variants: [
      { durationMinutes: 40, priceUZS: 350000 },
      { durationMinutes: 60, priceUZS: 400000 },
    ],
  },
  {
    rowNumber: 10,
    serviceRu: 'Комбинированный массаж',
    serviceUz: 'Kombinatsiyalangan massaj',
    optionsTextRu: '40 мин: 350 000 сум / 60 мин: 400 000 сум',
    optionsTextUz: "40 daq: 350 000 so'm / 60 daq: 400 000 so'm",
    variants: [
      { durationMinutes: 40, priceUZS: 350000 },
      { durationMinutes: 60, priceUZS: 400000 },
    ],
  },
];

/**
 * Complete Price List Data Bundle
 */
export const PRICE_LIST_DATA: PriceListData = {
  business: BUSINESS_CONTACTS,
  categories: SERVICE_CATEGORIES,
  posterRows: POSTER_ROWS,
};

// Aliases for convenience
export const businessContacts = BUSINESS_CONTACTS;
export const serviceCategories = SERVICE_CATEGORIES;
export const priceListData = PRICE_LIST_DATA;
export const posterRows = POSTER_ROWS;

/**
 * Format currency amount with space separators and UZS / so'm
 */
export function formatCurrencyUZS(amount: number, language: 'ru' | 'uz' = 'ru'): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return language === 'ru' ? `${formatted} UZS` : `${formatted} so'm`;
}

/**
 * Format currency amount with space separators and currency unit
 */
export function formatPriceUZS(amount: number, language: 'ru' | 'uz' = 'ru'): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return language === 'ru' ? `${formatted} сум` : `${formatted} so'm`;
}

/**
 * Format duration with localized suffix
 */
export function formatDuration(minutes: number, language: 'ru' | 'uz' = 'ru'): string {
  const mins = Math.round(Number(minutes) || 0);
  return language === 'ru' ? `${mins} мин` : `${mins} daq`;
}
