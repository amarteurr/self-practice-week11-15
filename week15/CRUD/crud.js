export const baseUrl = "https://bscit.sit.kmutt.ac.th/intproj25/or4/itb-ecors";

function makeHttpError(res, defaultMessage) {
  const err = new Error(defaultMessage + ": " + res.status);
  err.status = res.status;
  return err;
}

export async function getStudyPlans(token) {
  const url = baseUrl + "/api/v1/study-plans";

  let headers = {};
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  let headerObj = undefined;
  if (Object.keys(headers).length > 0) {
    headerObj = headers;
  }

  const res = await fetch(url, {
    headers: headerObj,
  });

  if (!res.ok) {
    throw makeHttpError(res, "GET study plans failed");
  }

  const body = await res.json();

  if (Array.isArray(body)) {
    return body;
  } else if (body && typeof body === "object") {
    if ("data" in body && Array.isArray(body.data)) {
      return body.data;
    } else if ("study_plans" in body && Array.isArray(body.study_plans)) {
      return body.study_plans;
    }
  }

  console.warn("Unexpected study-plans response shape:", body);
  return [];
} 

// GET /api/v1/students/{studentId}/declared-plan
export async function getDeclaredPlan(studentId, token) {
  const url = baseUrl + "/api/v1/students/" + studentId + "/declared-plan";

  const headers = {};
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: Object.keys(headers).length ? headers : undefined,
  });

  const text = await res.text();

  if (res.status === 404) {
    const err = new Error("NotFound");
    err.status = 404;
    err.body = text;
    throw err;
  }

  if (!res.ok) {
    const err = makeHttpError(res, "GET declared-plan failed");
    err.body = text;
    throw err;
  }

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    console.warn("Cannot parse declared-plan response:", e);
    return null;
  }

  if (!body) return null;

  // รองรับได้หลายรูปแบบที่ BE อาจส่งมา
  if (Array.isArray(body)) {
    return body[0] ?? null;
  }

  if (body && typeof body === "object") {
    if ("data" in body && Array.isArray(body.data)) {
      return body.data[0] ?? null;
    }
    if ("data" in body && typeof body.data === "object") {
      return body.data;
    }
  }

  return body;
}

// POST /api/v1/students/{studentId}/declared-plan
export async function postDeclarePlan(studentId, planId, token) {
  const url = baseUrl + "/api/v1/students/" + studentId + "/declared-plan";

  const payload = {
    planId: Number(planId),
    plan_id: Number(planId), // กันกรณี BE ใช้ชื่อฟิลด์ไม่เหมือนกัน
  };

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (res.status === 201 || res.status === 200) {
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Cannot parse declare-plan response:", e);
      return null;
    }
  }

  if (res.status === 409) {
    const err = new Error("Conflict");
    err.status = 409;
    err.body = text;
    throw err;
  }

  const err = makeHttpError(res, "POST declared-plan failed");
  err.body = text;
  throw err;
}

// PUT /api/v1/students/{studentId}/declared-plan
export async function putChangePlan(studentId, planId, token) {
  const url = baseUrl + "/api/v1/students/" + studentId + "/declared-plan";

  const payload = { planId: Number(planId) };

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (res.status === 200) {
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Cannot parse change-plan response:", e);
      return null;
    }
  }

  if (res.status === 404) {
    const err = new Error("NotFound");
    err.status = 404;
    err.body = text;
    throw err;
  }

  if (res.status === 409) {
    const err = new Error("Conflict");
    err.status = 409;
    err.body = text;
    throw err;
  }

  const err = new Error("PUT failed");
  err.status = res.status;
  err.body = text;
  throw err;
}

// DELETE /api/v1/students/{studentId}/declared-plan
export async function deleteDeclaredPlan(studentId, token) {
  const url = baseUrl + "/api/v1/students/" + studentId + "/declared-plan";

  const headers = {};
  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(url, {
    method: "DELETE",
    headers: Object.keys(headers).length ? headers : undefined,
  });

  const text = await res.text();

  // PBI6 เดิม: 204 ไม่มี body → ไม่มี declared plan แล้ว
  if (res.status === 204) {
    return null;
  }

  // PBI7: 200 + JSON (status = CANCELLED, updatedAt = เวลายกเลิก)
  if (res.status === 200) {
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Cannot parse cancel-plan response:", e);
      return null;
    }
  }

  if (res.status === 404) {
    const err = new Error("NotFound");
    err.status = 404;
    err.body = text;
    throw err;
  }

  if (res.status === 409) {
    const err = new Error("Conflict");
    err.status = 409;
    err.body = text;
    throw err;
  }

  const err = new Error("DELETE failed");
  err.status = res.status;
  err.body = text;
  throw err;
}