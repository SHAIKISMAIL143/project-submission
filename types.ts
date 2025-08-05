
export interface AIAnalysisResult {
  pageCount?: number;
  hasColor?: boolean;
  imageQuality?: string;
  documentType?: string;
  documentContentSummary?: string;
  fileExtension?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  blobUrl: string;
  timestamp: number;
  analysis?: AIAnalysisResult;
  analysisState?: 'idle' | 'loading' | 'success' | 'error';
  analysisError?: string;
}