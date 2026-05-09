import axios from 'axios';
import { env } from '../config/env.js';
import type { DocumentParseResponse, HousingMatchResponse, WardAnalysisResponse } from '../types/shared.js';

type WardPayload = {
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
};

export class MicroservicesClient {
  private readonly baseUrl?: string;

  constructor(baseUrl = env.NIVASAI_SERVICES_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async classifyComplaint(complaintId: string): Promise<void> {
    await this.postIfConfigured('/complaint-classifier/classifyComplaint', { complaintId });
  }

  async routeComplaint(complaintId: string, officerId?: string): Promise<void> {
    await this.postIfConfigured('/complaint-router/manualRouteComplaint', { complaintId, officerId });
  }

  async analyzeWard(payload: WardPayload): Promise<WardAnalysisResponse> {
    if (!this.baseUrl) {
      return {
        analysis: {
          wardId: payload.wardId,
          scores: {
            roadConnectivity: 0,
            waterAccess: 0,
            sanitationCoverage: 0,
            electricityAccess: 0,
            greenCoverage: 0,
            informalSettlements: 0,
          },
          summary: 'Ward analysis microservice is not configured yet.',
          topPriority: 'Configure NIVASAI_SERVICES_BASE_URL',
          estimatedPopulation: 0,
          analyzedAt: new Date().toISOString(),
        },
        report: { projects: [] },
      };
    }

    const { data } = await axios.post<WardAnalysisResponse>(`${this.baseUrl}/ward-analyzer/analyzeWard`, payload);
    return data;
  }

  async matchHousing(payload: unknown): Promise<HousingMatchResponse> {
    if (!this.baseUrl) {
      return { matches: [] };
    }

    const { data } = await axios.post<HousingMatchResponse>(`${this.baseUrl}/housing-matcher/matchHousing`, payload);
    return data;
  }

  async parseDocument(documentId: string): Promise<DocumentParseResponse> {
    if (!this.baseUrl) {
      return {
        documentId,
        status: 'pending',
        extractedData: {},
        confidence: 0,
      };
    }

    const { data } = await axios.post<DocumentParseResponse>(`${this.baseUrl}/document-parser/parseDocument`, {
      documentId,
    });
    return data;
  }

  async broadcastNotification(payload: unknown): Promise<void> {
    await this.postIfConfigured('/notification-broadcaster/broadcastNotification', payload);
  }

  private async postIfConfigured(path: string, payload: unknown): Promise<void> {
    if (!this.baseUrl) {
      return;
    }

    await axios.post(`${this.baseUrl}${path}`, payload);
  }
}

export const microservicesClient = new MicroservicesClient();
