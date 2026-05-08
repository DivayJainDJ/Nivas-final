import { analyzeWard } from '../lib/api/wardApi.js'

export async function analyzeWardInfrastructure(ward) {
  return analyzeWard(ward)
}
