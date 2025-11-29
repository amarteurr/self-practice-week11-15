// Config: Keycloak + Path
import { getStudyPlans,getDeclaredPlan,postDeclarePlan,putChangePlan,deleteDeclaredPlan } from "../CRUD/crud.js";
import keycloak from "../../keyCloak/config.js";

// Profile + Sign out (Keycloak)
const nameElement = document.getElementById("ecors-fullname");

function showProfile() {
  if (!nameElement) {
    console.error("ecors-fullname element not found");
    return;
  }
  const tokenData = keycloak.idTokenParsed;
  let name = "Student";
  if (tokenData && tokenData.name) {
    name = tokenData.name;
  }
  nameElement.textContent = "Welcome, " + name;
}

function showSignOut() {
  const btn = document.getElementById("ecors-button-signout");
  if (!btn) {
    console.error("ecors-button-signout element not found");
    return;
  }
  btn.classList.add("ecors-button-signout");
  if (btn.textContent.trim() === "") {
    btn.textContent = "Sign Out";
  }
  btn.addEventListener("click", function (e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    keycloak.logout({
      redirectUri: window.location.origin + "/intproj25/or4/itb-ecors/",
    });
  });
}

// Global state & elements
let studyPlans = [];
let currentDeclaredPlanId = null;
let currentStatus = null; // DECLARED / CANCELLED

const mainEl = document.getElementById("ecors-main");
const declaredStatusTextEl = document.getElementById("ecors-declared-plan");
const dropdownEl = document.getElementById("ecors-dropdown-plan");
const declareBtnEl = document.getElementById("ecors-button-declare");
const changeBtnEl = document.getElementById("ecors-button-change");
const cancelBtnEl = document.getElementById("ecors-button-cancel");

// Dialog-related elements
let dialogEl = document.getElementById("ecors-dialog");
let dialogMsgEl = document.getElementById("ecors-dialog-message");
let dialogOkBtnEl = document.getElementById("ecors-button-dialog");
let dialogKeepBtnEl = null;
let dialogCancelBtnEl = null;

// Dialog setup
function initDialog() {
  dialogEl = document.getElementById("ecors-dialog");
  dialogMsgEl = document.getElementById("ecors-dialog-message");
  dialogOkBtnEl = document.getElementById("ecors-button-dialog");

  if (!dialogEl || !dialogMsgEl || !dialogOkBtnEl) {
    console.error("Dialog base elements not found in reserve.html");
    return;
  }

  dialogEl.classList.add("ecors-dialog");
  dialogMsgEl.classList.add("ecors-dialog-message");
  dialogOkBtnEl.classList.add("ecors-button-dialog");
  if (!dialogOkBtnEl.textContent.trim()) {
    dialogOkBtnEl.textContent = "OK";
  }

  const card = dialogEl.querySelector(".bg-white");
  if (!card) {
    console.error("Dialog card (.bg-white) not found inside #ecors-dialog");
    return;
  }

  let buttonRow = card.querySelector(".ecors-dialog-buttons");
  if (!buttonRow) {
    buttonRow = document.createElement("div");
    buttonRow.classList.add(
      "ecors-dialog-buttons",
      "flex",
      "flex-col",
      "sm:flex-row",
      "gap-3",
      "justify-end",
      "mt-4"
    );
    card.appendChild(buttonRow);
  }

  if (dialogOkBtnEl.parentElement !== buttonRow) {
    buttonRow.appendChild(dialogOkBtnEl);
  }

  // Keep Declaration button
  dialogKeepBtnEl = dialogEl.querySelector(".ecors-button-keep");
  if (!dialogKeepBtnEl) {
    dialogKeepBtnEl = document.createElement("button");
    dialogKeepBtnEl.type = "button";
    dialogKeepBtnEl.className =
      "ecors-button-keep px-4 py-2 text-base sm:text-lg text-gray-700 border border-gray-400 bg-white";
    dialogKeepBtnEl.textContent = "Keep Declaration";
    buttonRow.appendChild(dialogKeepBtnEl);
  }

  // Cancel Declaration button (for confirm dialog)
  dialogCancelBtnEl = dialogEl.querySelector(".ecors-button-cancel.ecors-dialog-cancel");
  if (!dialogCancelBtnEl) {
    dialogCancelBtnEl = document.createElement("button");
    dialogCancelBtnEl.type = "button";
    dialogCancelBtnEl.className =
      "ecors-button-cancel ecors-dialog-cancel px-4 py-2 text-base sm:text-lg text-white bg-red-600";
    dialogCancelBtnEl.textContent = "Cancel Declaration";
    buttonRow.insertBefore(dialogCancelBtnEl, dialogOkBtnEl);
  }

  dialogEl.classList.add("hidden");
  dialogCancelBtnEl.classList.add("hidden");
  dialogKeepBtnEl.classList.add("hidden");
}

function showDialogContainer() {
  if (!dialogEl) initDialog();
  if (!dialogEl) return;
  dialogEl.classList.remove("hidden");
}

function hideDialogContainer() {
  if (!dialogEl) return;
  dialogEl.classList.add("hidden");
}

// Dialogs
function showDialog(message) {
  return new Promise((resolve) => {
    if (!dialogEl || !dialogMsgEl || !dialogOkBtnEl) {
      initDialog();
    }
    if (!dialogEl || !dialogMsgEl || !dialogOkBtnEl) {
      alert(message);
      resolve();
      return;
    }

    dialogMsgEl.textContent = message;

    dialogOkBtnEl.classList.remove("hidden");
    if (dialogCancelBtnEl) dialogCancelBtnEl.classList.add("hidden");
    if (dialogKeepBtnEl) dialogKeepBtnEl.classList.add("hidden");

    showDialogContainer();

    function cleanup() {
      hideDialogContainer();
      dialogOkBtnEl.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      resolve();
    }

    function onClick() {
      cleanup();
    }

    function onKey(e) {
      if (e.key === "Escape") {
        cleanup();
      }
    }

    dialogOkBtnEl.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
  });
}

// confirm dialog สำหรับ Cancel Declaration
function showConfirmCancelDialog(message) {
  return new Promise((resolve) => {
    if (!dialogEl || !dialogMsgEl || !dialogCancelBtnEl || !dialogKeepBtnEl) {
      initDialog();
    }
    if (!dialogEl || !dialogMsgEl || !dialogCancelBtnEl || !dialogKeepBtnEl) {
      const keep = confirm(message);
      resolve(keep ? "keep" : "cancel");
      return;
    }

    dialogMsgEl.textContent = message;

    dialogOkBtnEl.classList.add("hidden");
    dialogCancelBtnEl.classList.remove("hidden");
    dialogKeepBtnEl.classList.remove("hidden");

    showDialogContainer();

    function cleanup(result) {
      hideDialogContainer();
      dialogCancelBtnEl.removeEventListener("click", onCancel);
      dialogKeepBtnEl.removeEventListener("click", onKeep);
      window.removeEventListener("keydown", onKey);

      dialogCancelBtnEl.classList.add("hidden");
      dialogKeepBtnEl.classList.add("hidden");
      dialogOkBtnEl.classList.remove("hidden");

      resolve(result);
    }

    function onCancel() {
      cleanup("cancel");
    }

    function onKeep() {
      cleanup("keep");
    }

    function onKey(e) {
      if (e.key === "Escape") {
        cleanup("keep");
      }
    }

    dialogCancelBtnEl.addEventListener("click", onCancel);
    dialogKeepBtnEl.addEventListener("click", onKeep);
    window.addEventListener("keydown", onKey);
  });
}

// Helpers
function getStudentId() {
  let tokenData = {};
  if (keycloak.idTokenParsed) {
    tokenData = keycloak.idTokenParsed;
  } else if (keycloak.tokenParsed) {
    tokenData = keycloak.tokenParsed;
  }
  if (tokenData.studentId) return tokenData.studentId;
  if (tokenData.student_id) return tokenData.student_id;
  if (tokenData.preferred_username) return tokenData.preferred_username;
  if (tokenData.sub) return tokenData.sub;
  return null;
}

function setDeclareButtonEnabled(enabled) {
  if (!declareBtnEl) return;
  declareBtnEl.disabled = !enabled;

  if (enabled) {
    declareBtnEl.classList.remove("bg-gray-400", "cursor-not-allowed");
    declareBtnEl.classList.add("bg-blue-800", "cursor-pointer", "hover:bg-blue-700");
  } else {
    declareBtnEl.classList.remove("bg-blue-800", "cursor-pointer", "hover:bg-blue-700");
    declareBtnEl.classList.add("bg-gray-400", "cursor-not-allowed");
  }
}

function setChangeButtonEnabled(enabled) {
  if (!changeBtnEl) return;
  changeBtnEl.disabled = !enabled;

  if (enabled) {
    changeBtnEl.classList.remove("bg-gray-400", "cursor-not-allowed");
    changeBtnEl.classList.add("bg-blue-800", "cursor-pointer", "hover:bg-blue-700");
  } else {
    changeBtnEl.classList.remove("bg-blue-800", "cursor-pointer", "hover:bg-blue-700");
    changeBtnEl.classList.add("bg-gray-400", "cursor-not-allowed");
  }
}

function showDeclareFeature() {
  if (!dropdownEl) return;

  dropdownEl.disabled = false;
  dropdownEl.classList.remove("bg-gray-100", "cursor-not-allowed");

  if (declareBtnEl) {
    declareBtnEl.classList.remove("hidden");
    setDeclareButtonEnabled(false);
  }
  if (changeBtnEl) {
    changeBtnEl.classList.add("hidden");
    setChangeButtonEnabled(false);
  }
  if (cancelBtnEl) {
    cancelBtnEl.classList.add("hidden");
  }

  currentDeclaredPlanId = null;
  currentStatus = null;
}

function showChangeFeature() {
  if (!dropdownEl) return;

  dropdownEl.disabled = false;
  dropdownEl.classList.remove("bg-gray-100", "cursor-not-allowed");

  if (declareBtnEl) {
    declareBtnEl.classList.add("hidden");
    setDeclareButtonEnabled(false);
  }

  if (changeBtnEl) {
    changeBtnEl.classList.remove("hidden");
    setChangeButtonEnabled(false);
  }

  if (cancelBtnEl) {
    cancelBtnEl.classList.remove("hidden");
  }
}

function hideAllActions() {
  if (dropdownEl) {
    dropdownEl.disabled = true;
    dropdownEl.classList.add("cursor-not-allowed", "bg-gray-100");
  }
  if (declareBtnEl) {
    declareBtnEl.classList.add("hidden");
    setDeclareButtonEnabled(false);
  }
  if (changeBtnEl) {
    changeBtnEl.classList.add("hidden");
    setChangeButtonEnabled(false);
  }
  if (cancelBtnEl) {
    cancelBtnEl.classList.add("hidden");
  }
}

function formatUpdatedAt(iso) {
  if (!iso) return "N/A";
  const date = iso instanceof Date ? iso : new Date(iso);

  let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const overrideTz = window.localStorage.getItem("ecors_timezone");
  if (overrideTz !== null && overrideTz !== "") {
    tz = overrideTz;
  }

  const str = date.toLocaleString("en-GB", {
    timeZone: tz,
    hour12: false,
  });

  return str + " (" + tz + ")";
}

function findPlanById(planId) {
  if (!planId || !Array.isArray(studyPlans)) return null;
  const pid = Number(planId);
  return studyPlans.find((p) => Number(p.id) === pid) || null;
}

// Load study plans
async function loadStudyPlans(token) {
  if (!dropdownEl) {
    console.error("ecors-dropdown-plan element not found");
    return;
  }

  try {
    const plans = await getStudyPlans(token);
    studyPlans = Array.isArray(plans) ? plans : [];

    while (dropdownEl.firstChild) {
      dropdownEl.removeChild(dropdownEl.firstChild);
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.selected = true;
    defaultOption.textContent = "-- Select Major --";
    dropdownEl.appendChild(defaultOption);

    if (!Array.isArray(studyPlans) || studyPlans.length === 0) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "No available study plans";
      dropdownEl.appendChild(opt);

      dropdownEl.disabled = true;
      hideAllActions();
      return;
    }

    studyPlans.forEach((p) => {
      const opt = document.createElement("option");
      const id = p.id;
      const code = p.planCode;
      const nameEng = p.nameEng;
      opt.value = id;
      opt.textContent = code + " - " + nameEng;
      opt.classList.add("ecors-plan-row");
      dropdownEl.appendChild(opt);
    });

    dropdownEl.disabled = false;
  } catch (err) {
    console.error("Error fetching study plans:", err);
    await showDialog("There is a problem. Please try again later.");
    hideAllActions();
  }
}

// Load declared status
async function loadDeclaredStatus(studentId, token) {
  if (!declaredStatusTextEl) {
    console.error("ecors-declared-plan element not found");
  }

  try {
    const declared = await getDeclaredPlan(studentId, token);

    if (!declared || !declared.planId) {
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent = "Declaration Status: Not Declared";
      }
      if (dropdownEl) {
        dropdownEl.value = "";
      }
      showDeclareFeature();
      return;
    }

    const planId = declared.planId;
    currentDeclaredPlanId = Number(planId);

    let status = declared.status || "DECLARED";
    currentStatus = status;

    const plan = findPlanById(planId);
    if (!plan) {
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent =
          "Declaration Status: Declared (Unknown plan id=" + planId + ")";
      }
      hideAllActions();
      return;
    }

    const code = plan.planCode;
    const nameEng = plan.nameEng;
    const updatedValue = declared.updatedAt;
    const formattedUpdated = formatUpdatedAt(updatedValue);

    if (currentStatus === "CANCELLED") {
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent =
          "Declaration Status: Cancelled " +
          code +
          " - " +
          nameEng +
          " plan on " +
          formattedUpdated;
      }
      if (dropdownEl) {
        dropdownEl.value = "";
      }
      showDeclareFeature();
      return;
    }

    if (declaredStatusTextEl) {
      declaredStatusTextEl.textContent =
        "Declaration Status: Declared " +
        code +
        " - " +
        nameEng +
        " plan on " +
        formattedUpdated;
    }
    if (dropdownEl && currentDeclaredPlanId) {
      dropdownEl.value = String(currentDeclaredPlanId);
    }

    showChangeFeature();
  } catch (err) {
    console.error("Error loading declared status:", err);

    if (declaredStatusTextEl) {
      declaredStatusTextEl.textContent = "Declaration Status: Not Declared";
    }
    if (dropdownEl) {
      dropdownEl.value = "";
    }

    if (err && err.status === 404) {
      showDeclareFeature();
    } else {
      hideAllActions();
    }
  }
}

// Declare plan
async function declarePlan(studentId, token) {
  if (!dropdownEl) {
    console.error("ecors-dropdown-plan element not found");
    return;
  }

  if (!dropdownEl.value) {
    await showDialog("Please select a study plan.");
    return;
  }

  if (!token) {
    console.error("Missing studentId or token");
    await keycloak.login();
    return;
  }

  setDeclareButtonEnabled(false);

  try {
    const planId = dropdownEl.value;
    const selectedOption = dropdownEl.options[dropdownEl.selectedIndex];

    let selectedText = "";
    if (selectedOption && selectedOption.textContent) {
      selectedText = selectedOption.textContent.trim();
    }

    const dialogText = "Declared " + selectedText;

    await postDeclarePlan(studentId, planId, token);
    await loadDeclaredStatus(studentId, token);
    await showDialog(dialogText);
  } catch (err) {
    console.error("Error declaring plan:", err);

    if (err && err.status === 409) {
      await showDialog(
        "You may have declared study plan already. Please check again."
      );
      await loadDeclaredStatus(studentId, token);
      return;
    }

    await showDialog("There is a problem. Please try again later.");
    setDeclareButtonEnabled(true);
  }
}

// Change plan
async function changePlan(studentId, token) {
  if (!dropdownEl) {
    console.error("ecors-dropdown-plan element not found");
    return;
  }

  const planId = dropdownEl.value;

  if (!planId) {
    await showDialog("Please select a study plan.");
    return;
  }

  if (!token) {
    console.error("Missing studentId or token");
    await keycloak.login();
    return;
  }

  if (
    currentDeclaredPlanId !== null &&
    Number(planId) === Number(currentDeclaredPlanId)
  ) {
    setChangeButtonEnabled(false);
    return;
  }

  setChangeButtonEnabled(false);

  try {
    const updated = await putChangePlan(studentId, planId, token);

    let newPlanId = updated.planId || planId;
    currentDeclaredPlanId = Number(newPlanId);

    let status = updated.status || "DECLARED";
    currentStatus = status;

    await loadDeclaredStatus(studentId, token);
    await showDialog("Declaration updated.");
  } catch (err) {
    console.error("Error changing plan:", err);

    if (err && err.status === 404) {
      await showDialog(
        "No declared plan found for student with id=" + studentId + "."
      );
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent = "Declaration Status: Not Declared";
      }
      if (dropdownEl) {
        dropdownEl.value = "";
      }
      showDeclareFeature();
      return;
    }

    if (err && err.status === 409) {
      await showDialog(
        "Cannot update the declared plan because it has been cancelled."
      );
      await loadDeclaredStatus(studentId, token);
      return;
    }

    await showDialog("There is a problem. Please try again later.");
  }
}

// Cancel plan
async function cancelPlan(studentId, token) {
  if (!token) {
    await keycloak.login();
    return;
  }

  if (currentDeclaredPlanId === null) {
    await showDialog("Declaration Status: Not Declared");
    if (dropdownEl) dropdownEl.value = "";
    showDeclareFeature();
    return;
  }

  const plan = findPlanById(currentDeclaredPlanId);
  const code = plan?.planCode ?? "";
  const nameEng = plan?.nameEng ?? "";

  let timePart = "";
  if (declaredStatusTextEl && declaredStatusTextEl.textContent) {
    const txt = declaredStatusTextEl.textContent;
    const idx = txt.lastIndexOf(" on ");
    if (idx !== -1) {
      timePart = txt.substring(idx + 4).trim();
    }
  }

  const confirmMessage =
    "You have declared " +
    code +
    " - " +
    nameEng +
    " as your plan on " +
    timePart +
    ". Are you sure you want to cancel this declaration?";

  const choice = await showConfirmCancelDialog(confirmMessage);

  if (choice === "keep") {
    return;
  }

  try {
    const result = await deleteDeclaredPlan(studentId, token);

    if (result && result.status === "CANCELLED" && result.updatedAt) {
      const planAfter =
        findPlanById(result.planId ?? currentDeclaredPlanId) || plan;
      const code2 = planAfter?.planCode ?? code;
      const nameEng2 = planAfter?.nameEng ?? nameEng;
      const formatted = formatUpdatedAt(result.updatedAt);

      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent =
          "Declaration Status: Cancelled " +
          code2 +
          " - " +
          nameEng2 +
          " plan on " +
          formatted;
      }

      if (dropdownEl) dropdownEl.value = "";

      currentDeclaredPlanId = result.planId ?? currentDeclaredPlanId;
      currentStatus = "CANCELLED";
      showDeclareFeature();
    } else {
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent = "Declaration Status: Not Declared";
      }
      if (dropdownEl) dropdownEl.value = "";
      currentDeclaredPlanId = null;
      currentStatus = null;
      showDeclareFeature();
    }

    await showDialog("Declaration cancelled.");
  } catch (err) {
    console.error("Error cancelling plan:", err);

    if (err && err.status === 404) {
      if (declaredStatusTextEl) {
        declaredStatusTextEl.textContent = "Declaration Status: Not Declared";
      }
      if (dropdownEl) dropdownEl.value = "";
      showDeclareFeature();
      await showDialog(
        "No declared plan found for student with id=" + studentId + "."
      );
      return;
    }

    if (err && err.status === 409) {
      await showDialog(
        "Cannot cancel the declared plan because it is already cancelled."
      );
      await loadDeclaredStatus(studentId, token);
      return;
    }

    await showDialog("There is a problem. Please try again later.");
  }
}

// Init
async function init() {
  initDialog();

  if (declareBtnEl) {
    declareBtnEl.classList.add("ecors-button-declare");
  }
  if (changeBtnEl) {
    changeBtnEl.classList.add("ecors-button-change");
  }
  if (cancelBtnEl) {
    cancelBtnEl.classList.add("ecors-button-cancel");
  }

  if (declaredStatusTextEl) {
    declaredStatusTextEl.textContent = "Loading declaration status...";
  }

  const studentId = getStudentId();
  const token = keycloak.token;

  // *** สำคัญ: ถ้าไม่มี token ให้เด้งไป login ทันที ***
  if (!token) {
    console.error("No token from Keycloak");
    await keycloak.login();
    return;
  }

  // Auth ผ่านแล้ว → โชว์ main
  if (mainEl) {
    mainEl.classList.remove("hidden");
  }

  await loadStudyPlans(token);
  await loadDeclaredStatus(studentId, token);

  if (dropdownEl) {
    dropdownEl.addEventListener("change", function () {
      const value = dropdownEl.value;
      if (currentDeclaredPlanId !== null) {
        if (value && Number(value) !== Number(currentDeclaredPlanId)) {
          setChangeButtonEnabled(true);
        } else {
          setChangeButtonEnabled(false);
        }
        return;
      }
      if (value) {
        if (declareBtnEl) declareBtnEl.classList.remove("hidden");
        setDeclareButtonEnabled(true);
      } else {
        setDeclareButtonEnabled(false);
      }
    });
  }

  if (declareBtnEl) {
    declareBtnEl.addEventListener("click", function () {
      declarePlan(studentId, token);
    });
  }

  if (changeBtnEl) {
    changeBtnEl.addEventListener("click", function () {
      changePlan(studentId, token);
    });
  }

  if (cancelBtnEl) {
    cancelBtnEl.addEventListener("click", function () {
      cancelPlan(studentId, token);
    });
  }

  window.declarePlan = function () {
    declarePlan(studentId, token);
  };
  window.changePlan = function () {
    changePlan(studentId, token);
  };
  window.cancelPlan = function () {
    cancelPlan(studentId, token);
  };
}

// Prevent back button returning cached page (bfcache)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

// Keycloak init
(async function () {
  try {
    await keycloak.init({
      onLoad: "login-required",
    });

    if (!keycloak.authenticated) {
      await keycloak.login();
      return;
    }

    showProfile();
    showSignOut();
    await init();
  } catch (error) {
    console.error("Keycloak initialization failed:", error);
    window.location.href = "/intproj25/or4/itb-ecors/";
  }
})();