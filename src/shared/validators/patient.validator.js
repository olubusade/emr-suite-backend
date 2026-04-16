import ApiError from '../utils/ApiError.js';
import {MARITAL_ENUM, GENOTYPE_ENUM, BLOOD_ENUM,GENDER_ENUM } from '../validation/enums/patient.enums.js'
export function validatePatientEnums(data) {
  if (data.maritalStatus && !MARITAL_ENUM.includes(data.maritalStatus)) {
    throw new ApiError(400, 'Invalid marital status');
  }

  if (data.genotype && !GENOTYPE_ENUM.includes(data.genotype)) {
    throw new ApiError(400, 'Invalid genotype');
  }

  if (data.bloodGroup && !BLOOD_ENUM.includes(data.bloodGroup)) {
    throw new ApiError(400, 'Invalid blood group');
  }
  if (data.gender && !GENDER_ENUM.includes(data.gender)) {
    throw new ApiError(400, 'Invalid gender');
  }
}