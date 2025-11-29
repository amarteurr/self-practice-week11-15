import { apiGet } from "../mylibrary/fetchapi.js"

export const baseUrl = "http://localhost:3000"

export const fetchStudyPlans = async () => {
    try {
        return await apiGet(`${baseUrl}/api/v1/study-plans`)
    } catch {
        throw new Error("There is a problem. please try again later.")
    }
}