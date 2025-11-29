import keycloak from "../../keyCloak/config.js";
import { declarePlan } from "../crud/DeclarePlan.js";
import { getStudyPlans } from "../CRUD/studyPlanTable.js";

const nameElement = document.getElementById("ecors-fullname");

function showProfile() {
  const name =
    keycloak.idTokenParsed.name;
  nameElement.textContent = `Welcome, ${name}`;
  nameElement.classList.add("ecors-fullname");
}

function showSignOut() {
  const signOutButtonElement = document.getElementById("ecors-button-signout");
  signOutButtonElement.textContent = "Sign Out";
  signOutButtonElement.classList.add("ecors-button-signout");
}

function showStudyPlanSelect(select, data) {
  for (const plan of data) {
    const option = document.createElement("option");
    option.className = "ecors-plan-row";
    option.value = plan.id;
    option.textContent = `${plan.planCode} - ${plan.nameEng} (${plan.nameTh})`;
    select.appendChild(option);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const planSelect = document.querySelector(".ecors-dropdown-plan");
  try {
    const data = await getStudyPlans();
    showStudyPlanSelect(planSelect, data)
  } catch (err) {
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");
  const planSelect = document.querySelector(".ecors-dropdown-plan");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedPlanId = Number(planSelect.value);
    const studentId = keycloak.idTokenParsed.preferred_username;
    try {
      const resp = await declarePlan(studentId, selectedPlanId);
      console.log(resp);
    } catch (err) {
      console.error(err);
    }
  })
});


await keycloak.init({ onLoad: "login-required" });
showProfile();
showSignOut();

document.getElementById("ecors-button-signout").addEventListener("click", () => {
  if (event && event.preventDefault) {
    event.preventDefault();
  }

  keycloak.logout({
    redirectUri: window.location.origin + "/intproj25/or4/itb-ecors/",
  });
});