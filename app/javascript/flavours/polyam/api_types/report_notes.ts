import type { ApiReportJSON } from './reports';

export interface ApiReportNoteJSON {
  id: string;
  content: string;
  report: ApiReportJSON;
  created_at: string;
}
