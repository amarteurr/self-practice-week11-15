import { getStudyPlans } from "../CRUD/crud.js";

//Ensure dialog exists (create if missing)
function ensureDialogReady() {
    let dialog = document.querySelector("dialog.ecors-dialog");
    if (!dialog) {
        dialog = document.createElement("dialog");
        dialog.classList.add("ecors-dialog");
        dialog.id = "ecorsDialog";
        document.body.prepend(dialog);
    }
    if (!dialog.id) dialog.id = "ecorsDialog";
    dialog.setAttribute("closedby", "none");

    let msg = dialog.querySelector("#message");
    if (!msg) {
        msg = document.createElement("p");
        msg.id = "message";
        msg.className = "ecors-dialog-message";
        dialog.appendChild(msg);
    }
    return dialog;
}

//Open error dialog
function openErrorDialog(message = "There is a problem. Please try again later.") {
    const dialog = ensureDialogReady();
    const msg = dialog.querySelector("#message");
    msg.textContent = message;
    dialog.setAttribute("closedby", "none");

    if (!dialog.dataset.escLocked) {
        dialog.addEventListener("cancel", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
        });
        dialog.dataset.escLocked = "true";
    }

    try {
        if (!dialog.open) dialog.showModal();
    } catch {
        dialog.setAttribute("open", "");
        dialog.style.zIndex = 9999;
    }

    requestAnimationFrame(() => {
        dialog.setAttribute("closedby", "none");
    });
}

//ecors-button-manage
function buttonMessage() {
  const btn = document.querySelector("#ecors-button-manage");
  if (!btn) return;

  btn.textContent =
    "Manage study plan declaration and course reservation";
  btn.classList.add("ecors-button-manage");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./reserve.html";
  });
}
buttonMessage();

//UI: create & render table
function createTable(container) {
    const table = document.createElement("table");
    table.setAttribute("border", "1");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "8");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.style.backgroundColor = "#f2f2f2";
    ["ID", "Study Code", "English Name", "Thai Name"].forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

    function renderRows(data) {
        while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

        if (!Array.isArray(data)) return;

        data
            .slice()
            .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
            .forEach((plan) => {
                const tr = document.createElement("tr");
                tr.classList.add("ecors-row");

                const tdId = document.createElement("td");
                tdId.classList.add("ecors-id");
                tdId.textContent = plan.id;
                tr.appendChild(tdId);

                const tdCode = document.createElement("td");
                tdCode.classList.add("ecors-planCode");
                tdCode.textContent = plan.planCode;
                tr.appendChild(tdCode);

                const tdEng = document.createElement("td");
                tdEng.classList.add("ecors-nameEng");
                tdEng.textContent = plan.nameEng;
                tr.appendChild(tdEng);

                const tdTh = document.createElement("td");
                tdTh.classList.add("ecors-nameTh");
                tdTh.textContent = plan.nameTh;
                tr.appendChild(tdTh);

                tbody.appendChild(tr);
            });
    }

    return { renderRows };
}

//Helpers to hide/show the container
function hideMajorList() {
    const el = document.getElementById("majorList");
    if (!el) return;
    const table = el.querySelector("table");
    if (table) {
        const tbody = table.querySelector("tbody");
        if (tbody) while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    }
    el.hidden = false;
}

function showMajorList() {
    const el = document.getElementById("majorList");
    if (!el) return;
    el.hidden = false;
}

//Main
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("crudForm");
    if (form) form.style.display = "none";

    const container = document.getElementById("majorList");
    if (!container) return;

    container.hidden = true;

    try {
        const data = await getStudyPlans();
        const { renderRows } = createTable(container);
        renderRows(data);
        showMajorList();
    } catch (err) {
        console.error(err);
        hideMajorList();
        openErrorDialog("There is a problem. Please try again later.");
    }
});

//Global fallbacks
window.addEventListener("unhandledrejection", (ev) => {
    console.error("Unhandled rejection:", ev.reason);
    hideMajorList();
    openErrorDialog("Network error (unhandled).");
});

window.addEventListener("error", (ev) => {
    console.error("Window error:", ev.error);
    console.error("Windows message:", ev.message);
});