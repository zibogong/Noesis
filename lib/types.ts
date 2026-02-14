export interface TranscriptSnippet {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptResponse {
  video_id: string;
  transcript: TranscriptSnippet[];
  success: boolean;
  message?: string;
}

export interface TextResponse {
  video_id: string;
  text: string;
  success: boolean;
  message?: string;
}

export interface LanguageInfo {
  language_code: string;
  language: string;
  is_generated: boolean;
  is_translatable: boolean;
}

export interface LanguagesResponse {
  video_id: string;
  available_languages: LanguageInfo[];
  success: boolean;
}

export interface SummaryResponse {
  video_id: string;
  summary: string;
  word_count: number;
  requested_length: number;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  detail: string;
}
