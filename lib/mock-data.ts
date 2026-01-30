import { Manga, Chapter, AtHomeServer } from './types';

export const MOCK_MANGA: Manga[] = [
  {
    id: '1',
    type: 'manga',
    attributes: {
      title: { en: 'Solo Leveling' },
      description: { en: 'In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jin-woo finds himself in a seemingly endless struggle for survival. After narrowly surviving an overwhelming powerful double dungeon that nearly wipes out his entire party, a mysterious program called the System chooses him as its sole player and in turn, gives him the extremely rare ability to level up in strength, possibly beyond any known limits.' },
      status: 'completed',
      year: 2018,
      contentRating: 'suggestive',
      originalLanguage: 'ko',
      tags: [
        { id: '1', type: 'tag', attributes: { name: { en: 'Action' } } as any },
        { id: '2', type: 'tag', attributes: { name: { en: 'Adventure' } } as any },
        { id: '3', type: 'tag', attributes: { name: { en: 'Fantasy' } } as any },
      ],
      lastChapter: '179',
    } as any,
    relationships: [
      { id: 'auth1', type: 'author', attributes: { name: 'Chugong' } as any },
      { id: 'cover1', type: 'cover_art', attributes: { fileName: 'solo-leveling-cover.jpg' } as any }
    ]
  },
  {
    id: '2',
    type: 'manga',
    attributes: {
      title: { en: 'One Piece' },
      description: { en: 'Gol D. Roger was known as the "Pirate King," the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world.' },
      status: 'ongoing',
      year: 1997,
      contentRating: 'safe',
      originalLanguage: 'ja',
      tags: [
        { id: '1', type: 'tag', attributes: { name: { en: 'Action' } } as any },
        { id: '2', type: 'tag', attributes: { name: { en: 'Adventure' } } as any },
        { id: '4', type: 'tag', attributes: { name: { en: 'Comedy' } } as any },
      ],
      lastChapter: '1100',
    } as any,
    relationships: [
      { id: 'auth2', type: 'author', attributes: { name: 'Eiichiro Oda' } as any },
      { id: 'cover2', type: 'cover_art', attributes: { fileName: 'one-piece-cover.jpg' } as any }
    ]
  },
  {
    id: '3',
    type: 'manga',
    attributes: {
      title: { en: 'Chainsaw Man' },
      description: { en: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses with Pochita.' },
      status: 'ongoing',
      year: 2018,
      contentRating: 'erotica',
      originalLanguage: 'ja',
      tags: [
        { id: '1', type: 'tag', attributes: { name: { en: 'Action' } } as any },
        { id: '5', type: 'tag', attributes: { name: { en: 'Horror' } } as any },
      ],
      lastChapter: '150',
    } as any,
    relationships: [
      { id: 'auth3', type: 'author', attributes: { name: 'Tatsuki Fujimoto' } as any },
      { id: 'cover3', type: 'cover_art', attributes: { fileName: 'chainsaw-man-cover.jpg' } as any }
    ]
  }
];

export const MOCK_CHAPTERS: Record<string, Chapter[]> = {
  '1': [
    {
      id: 'c1',
      type: 'chapter',
      attributes: {
        chapter: '1',
        title: 'The First Awakening',
        volume: '1',
        pages: 3,
        publishAt: '2018-03-04T00:00:00Z',
        translatedLanguage: 'en',
      } as any,
      relationships: [{ id: '1', type: 'manga' }]
    },
    {
      id: 'c2',
      type: 'chapter',
      attributes: {
        chapter: '2',
        title: 'The Second Awakening',
        volume: '1',
        pages: 3,
        publishAt: '2018-03-05T00:00:00Z',
        translatedLanguage: 'en',
      } as any,
      relationships: [{ id: '1', type: 'manga' }]
    }
  ],
  '2': [
    {
      id: 'c3',
      type: 'chapter',
      attributes: {
        chapter: '1',
        title: 'Romance Dawn',
        volume: '1',
        pages: 3,
        publishAt: '1997-07-22T00:00:00Z',
        translatedLanguage: 'en',
      } as any,
      relationships: [{ id: '2', type: 'manga' }]
    }
  ]
};

export const MOCK_PAGES: Record<string, AtHomeServer> = {
  'c1': {
    result: 'ok',
    baseUrl: 'https://cmdxd9890kptfbrn.mangadex.network',
    chapter: {
      hash: '207264a75a74e4438848d613c0133a8c',
      data: [
        '1-26c79a83a005080c108c3527a7c739d2906b864a66e14798e4d2574e4881768c.jpg',
        '2-9657f920216260a95e0c51d655f444c9b9868f9a2e1d7d8e8a6d8c4e4881768c.jpg',
        '3-d8c4e4881768c207264a75a74e4438848d613c0133a8c26c79a83a005080c108.jpg'
      ],
      dataSaver: []
    }
  },
  'c2': {
    result: 'ok',
    baseUrl: 'https://cmdxd9890kptfbrn.mangadex.network',
    chapter: {
      hash: '207264a75a74e4438848d613c0133a8c',
      data: [
        '1-26c79a83a005080c108c3527a7c739d2906b864a66e14798e4d2574e4881768c.jpg',
        '2-9657f920216260a95e0c51d655f444c9b9868f9a2e1d7d8e8a6d8c4e4881768c.jpg',
        '3-d8c4e4881768c207264a75a74e4438848d613c0133a8c26c79a83a005080c108.jpg'
      ],
      dataSaver: []
    }
  },
  'c3': {
    result: 'ok',
    baseUrl: 'https://cmdxd9890kptfbrn.mangadex.network',
    chapter: {
      hash: '207264a75a74e4438848d613c0133a8c',
      data: [
        '1-26c79a83a005080c108c3527a7c739d2906b864a66e14798e4d2574e4881768c.jpg',
        '2-9657f920216260a95e0c51d655f444c9b9868f9a2e1d7d8e8a6d8c4e4881768c.jpg',
        '3-d8c4e4881768c207264a75a74e4438848d613c0133a8c26c79a83a005080c108.jpg'
      ],
      dataSaver: []
    }
  }
};
