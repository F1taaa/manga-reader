import { deduplicateChapters } from './mangadex';
import { Chapter } from './types';

describe('MangaDex Utils', () => {
  describe('deduplicateChapters', () => {
    it('should deduplicate chapters by chapter number', () => {
      const mockChapters: any[] = [
        { id: '1', attributes: { chapter: '1', pages: 10 } },
        { id: '2', attributes: { chapter: '1', pages: 15 } },
        { id: '3', attributes: { chapter: '2', pages: 20 } },
      ];

      const result = deduplicateChapters(mockChapters as Chapter[]);
      expect(result.length).toBe(2);
      // Should pick chapter 1 with more pages (id: '2')
      const ch1 = result.find(c => c.attributes.chapter === '1');
      expect(ch1?.id).toBe('2');
    });

    it('should sort chapters descending', () => {
      const mockChapters: any[] = [
        { id: '1', attributes: { chapter: '1', pages: 10 } },
        { id: '3', attributes: { chapter: '2', pages: 20 } },
      ];

      const result = deduplicateChapters(mockChapters as Chapter[]);
      expect(result[0].attributes.chapter).toBe('2');
      expect(result[1].attributes.chapter).toBe('1');
    });
  });
});
