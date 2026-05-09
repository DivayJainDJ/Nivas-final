import {
  createHousingApplicationRecord,
  getFamilyProfileRecord,
  listHousingApplicationRecords,
  upsertFamilyProfileRecord,
} from '../repositories/housing.repository.js';
import { microservicesClient } from './microservicesClient.js';

export async function upsertFamilyProfile(userId: string, payload: any) {
  return upsertFamilyProfileRecord(userId, payload);
}

export async function getFamilyProfile(userId: string) {
  return getFamilyProfileRecord(userId);
}

export async function matchHousing(userId: string, payload: any) {
  const profile = payload.familyProfile ?? (await getFamilyProfile(userId));
  return microservicesClient.matchHousing({ familyProfile: profile });
}

export async function createHousingApplication(userId: string, payload: any) {
  return createHousingApplicationRecord(userId, payload);
}

export async function listHousingApplications(userId: string) {
  return listHousingApplicationRecords(userId);
}
