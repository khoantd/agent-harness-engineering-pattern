import { z } from 'zod';

export const FitSchema = z.enum(['direct', 'adapted', 'stretched']);

const Stringish = z.union([z.string(), z.number()]).transform(String);

export const PatternFrontmatterSchema = z.object({
  id: z.string(),
  number: Stringish,
  title: z.string(),
  chapter: z.string(),
  fit: FitSchema.default('adapted'),
  aka: z.string().optional(),
  review_id: z.string().optional(),
  figure_number: z.string().optional(),
  figure_caption: z.string().optional(),
  diagram: z.string().optional(),
  analogy_title: z.string().optional(),
});

export type PatternFrontmatter = z.infer<typeof PatternFrontmatterSchema>;

export type PatternSections = {
  gist: string;
  analogyTitle?: string;
  analogy?: string;
  classic?: string;
  harness?: string;
  enterprise?: string;
  steps: string[];
  code?: string;
  watch?: string;
};

export type Pattern = PatternFrontmatter &
  PatternSections & {
    path: string;
    url: string;
  };

export type ChapterMeta = {
  id: string;
  section_id: string;
  number: string;
  title: string;
  kick: string;
  summary: string;
  patterns: string[];
  url: string;
  path: string;
};

export type TocChapter = {
  id: string;
  number: string;
  title: string;
  patterns: { id: string; number: string; title: string; search_name: string }[];
};
