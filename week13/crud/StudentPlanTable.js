import { apiGet } from "../myLib/fetchUtils.js";

export const baseUrl = "/intproj25/or4/itb-ecors";

export async function fetchStudyPlans() {
  try {
    const url = `${baseUrl}/api/v1/study-plans`;
    return await apiGet(url);
  } catch {
    throw new Error("There is a problem. Please try again later.");
  }
}

export const getStudyPlans = fetchStudyPlans;