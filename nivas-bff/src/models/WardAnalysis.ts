import { Schema, model } from 'mongoose';

export type WardAnalysisDocument = {
  wardId: string;
  wardName?: string;
  scores: Record<string, number>;
  summary: string;
  topPriority: string;
  estimatedPopulation: number;
  report: Record<string, unknown>;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const wardAnalysisSchema = new Schema<WardAnalysisDocument>(
  {
    wardId: { type: String, required: true, unique: true, index: true },
    wardName: String,
    scores: { type: Schema.Types.Mixed, required: true },
    summary: { type: String, required: true },
    topPriority: { type: String, required: true },
    estimatedPopulation: { type: Number, default: 0 },
    report: { type: Schema.Types.Mixed, default: {} },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WardAnalysisModel = model<WardAnalysisDocument>('WardAnalysis', wardAnalysisSchema);
