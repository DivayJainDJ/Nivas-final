import {
  getWardAnalysisRecord,
  listWardAnalysisRecords,
  upsertWardAnalysisRecord,
} from '../repositories/ward.repository.js';
import { microservicesClient } from './microservicesClient.js';

export async function analyzeWard(wardId: string, payload: { wardName: string; lat: number; lng: number }) {
  const result = await microservicesClient.analyzeWard({ wardId, ...payload });

  await upsertWardAnalysisRecord(wardId, {
      wardId,
      wardName: payload.wardName,
      scores: result.analysis.scores,
      summary: result.analysis.summary,
      topPriority: result.analysis.topPriority,
      estimatedPopulation: result.analysis.estimatedPopulation,
      report: result.report as Record<string, unknown>,
      analyzedAt: result.analysis.analyzedAt,
    });

  return result;
}

export async function listWardAnalyses() {
  return listWardAnalysisRecords();
}

export async function getWardAnalysis(wardId: string) {
  return getWardAnalysisRecord(wardId);
}
