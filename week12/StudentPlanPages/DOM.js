export const errorDialog = document.querySelector(".ecors-dialog");
export const errorMessage = document.querySelector(".ecors-dialog-message");

export const majorList = document.querySelector("#majorList");
export const majorListTableBody = majorList.children[0].children[1];

errorDialog.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        e.preventDefault();
    }
})