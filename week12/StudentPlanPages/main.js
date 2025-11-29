import { fetchStudyPlans } from "../CRUD/studyplantable.js";
import { errorDialog, errorMessage, majorListTableBody } from "./DOM.js";


try {
    const studyPlans = await fetchStudyPlans();
    for (let i = 0; i < studyPlans.length; i++) {
        majorListTableBody.innerHTML += `
            <tr class="ecors-row">
                <td class="ecors-id">${studyPlans[i].id}</td>
                <td class="ecors-planCode">${studyPlans[i].planCode}</td>
                <td class="ecors-nameEng">${studyPlans[i].nameEng}</td>
                <td class="ecors-nameTh">${studyPlans[i].nameTh}</td>
            </tr>
        `
    }
} catch (error) {
    errorMessage.textContent = error.message;
    errorDialog.showModal();
}
