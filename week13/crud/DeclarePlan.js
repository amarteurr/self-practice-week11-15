import { apiPost } from "../myLib/fetchUtils.js";

export const baseUrl = "/intproj25/or4/itb-ecors";

export async function declarePlan(studentId, planId) {
    try {
        const url = `${baseUrl}/api/v1/students/${studentId}/declare-plan`;
        return await apiPost(url, {
            planId
        });
    } catch {
        throw new Error("There is a problem. Please try again later.");
    }
}