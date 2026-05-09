export type UserRole = 'resident' | 'officer' | 'admin';

export type ApiErrorBody = {
  error: string;
  message: string;
  code: number;
  details?: unknown;
};

export type LocationPayload = {
  lat: number;
  lng: number;
  address: string;
};

export type WardAnalysisResponse = {
  analysis: {
    wardId: string;
    scores: Record<string, number>;
    summary: string;
    topPriority: string;
    estimatedPopulation: number;
    analyzedAt: string;
  };
  report: {
    projects: unknown[];
  };
};

export type HousingMatchResponse = {
  matches: Array<{
    unit: unknown;
    score: number;
    explanation: string;
    eligibility: {
      eligible: boolean;
      missingDocuments: string[];
      incomeGap: number;
    };
    distance: number;
  }>;
};

export type DocumentParseResponse = {
  documentId: string;
  status: 'verified' | 'rejected' | 'needs_review' | 'pending';
  extractedData?: Record<string, unknown>;
  confidence?: number;
};
