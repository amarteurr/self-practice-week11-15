export const baseUrl = "";

// helper
function makeHttpError(res, defaultMessage) {
  const err = new Error(`${defaultMessage}: ${res.status}`);
  err.status = res.status;
  return err;
}

// GET /api/v1/study-plans
export async function getStudyPlans() {
  const url = `${baseUrl}/api/v1/study-plans`;

  const res = await fetch(url);
  if (!res.ok) {
    throw makeHttpError(res, "GET study plans failed");
  }

  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.study_plans)) return body.study_plans;
  console.warn("Unexpected study-plans response shape:", body);
  return [];
}

// GET /api/v1/students/{studentId}/declared-plan
export async function getDeclaredPlan(studentId, token) {
  const url = `${baseUrl}/api/v1/students/${studentId}/declared-plan`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    const err = new Error("NotFound");
    err.status = 404;
    throw err;
  }

  if (!res.ok) {
    throw makeHttpError(res, "GET declared-plan failed");
  }

  return res.json();
}

// POST /api/v1/students/{studentId}/declared-plan
export async function postDeclarePlan(studentId, planId, token) {
  const url = `${baseUrl}/api/v1/students/${studentId}/declared-plan`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });

  if (res.status === 201) {
    return res.json();
  }

  if (res.status === 409) {
    const err = new Error("Conflict");
    err.status = 409;
    throw err;
  }

  throw makeHttpError(res, "POST declared-plan failed");
}