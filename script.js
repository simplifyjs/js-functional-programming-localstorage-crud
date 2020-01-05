/* Form Element */
let bookingForm = document.getElementById("bookingForm");

/* Onload output data */
window.onload = function() {
  let storageVal = fetchLocalStorageVal("formVal");
  if (storageVal) {
    processFetchedData([...storageVal]);
    crudButtonListener(".edit-item", "edit", "click");
    crudButtonListener(".delete-item", "delete", "click");
  }
};

function processFetchedData(data) {
  if (data) outputVal(data);
  return;
}

/* Provide addEventListener fallback for older browsers */
function formHandler(element, event, callback) {
  if ("addEventListener" in window || Element.prototype.addEventListener) {
    element.addEventListener(event, callback);
  } else if ("attachEvent") {
    element.attachEvent("on" + event, callback);
  } else {
    element["on" + event] = callback;
  }
}

/* Execute Form Submission Handler */
formHandler(bookingForm, "submit", e => {
  e.preventDefault(); // Prevent page loading upon submission
  resetErrDiv();

  if (getInputVal("idnum")) {
    validate(getAllInput(bookingForm, ".form-control"), "edit"); // Edit validation
  } else {
    validate(getAllInput(bookingForm, ".form-control"), "add"); // Add validation
  }
});

/* Get all input element */
function getAllInput(form, selector) {
  return form.querySelectorAll(selector);
}

/* Get each input value */
function getInputVal(id) {
  return document.getElementById(id).value;
}

/* Set each input value */
function setInputVal(id, val) {
  document.getElementById(id).value = val;
}

/* Fetch the existing value from localstorage */
function fetchLocalStorageVal(key) {
  return JSON.parse(localStorage.getItem(key));
}
/* Save to localstorage */
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* Execute to reset error div after succeeding submission */
function resetErrDiv() {
  document.querySelectorAll(".invalid-feedback").forEach(el => {
    el.style.display = "none";
  });
}

/* Display error message for affected input field */
function getErrDiv(name) {
  document.getElementById("err" + name).style.display = "block";
}

/* Form Validation */
function validate(formEl, mode) {
  let formErrField = [],
    formValObj = {},
    isError = false;

  /* Check if there is a value for required fields */
  formEl.forEach(el => {
    if (el.getAttribute("required") == "required" && !el.value) {
      formErrField.push(el.name);
      isError = true;
    } else {
      formValObj[el.getAttribute("id")] = getInputVal(el.getAttribute("id"));
    }
  });
  /* Fields with errors */
  if (isError) {
    outputError(formErrField);
    return;
  }
  processValidatedData(formValObj, mode);
}

/* Next step after validation: check mode, save, output */
function processValidatedData(valObj, mode) {
  let formProcessedVal;

  /* Set Id for Add and Edit mode */
  switch (mode) {
    case "add":
      formProcessedVal = setId(valObj);
      break;
    case "edit":
      formProcessedVal = editData(valObj);
      break;
    default:
      formProcessedVal = valObj;
      break;
  }

  saveToLocalStorage("formVal", formProcessedVal);
  outputVal(formProcessedVal);
}

/* Checks through each fields with error */
function outputError(formErrField) {
  formErrField.forEach(name => {
    getErrDiv(name);
  });
}

/* Set Id */
function setId(data) {
  let dataArr = [],
    existingData = fetchLocalStorageVal("formVal");

  if (!existingData) {
    data.idnum = 1;
  } else {
    dataArr.push(...existingData);
    data.idnum = dataArr.length + 1;
  }
  dataArr.push(data);
  return dataArr;
}

/* Edit existing data */
function editData(newData) {
  const data = [...fetchLocalStorageVal("formVal")];

  return data.map(item => {
    if (item.idnum.toString().includes(newData.idnum)) {
      item.idnum = +newData.idnum;
      item.name = newData.name;
      item.numGuest = +newData.numGuest;
      item.dateFrom = newData.dateFrom;
      item.dateTo = newData.dateTo;
    }
    return item;
  });
}

/* Create CRUD button */
function crudButton(elem, val, mode) {
  elem.setAttribute("id", mode.toLowerCase() + "-" + val.split("-")[1]);
  elem.setAttribute("class", mode.toLowerCase() + "-item");
  elem.setAttribute("role",  "button");
  elem.classList.add("btn");
  if(mode == 'Edit') {
    elem.classList.add("btn-secondary");
  } else {
    elem.classList.add("btn-danger");
  }
  elem.classList.add("btn-sm", "btn-block");
  cellText = document.createTextNode(val.split("-")[0]);
  return cellText;
}

/* Loop data to the DOM */
function loopRow(data) {
  let resultEl = document.getElementById("result"),
    tr = document.createElement("tr");

  if (data && data.idnum) {
    data.edit = "Edit-" + data.idnum;
    data.delete = "Delete-" + data.idnum;
  }

  Object.values(data).forEach((val, i) => {
    let td = document.createElement("td"),
      cellText = document.createTextNode(val);

    if (typeof val === "string") {
      if (val.includes("Edit")) {
        cellText = crudButton(td, val, "Edit");
      }
      if (val.includes("Delete")) {
        cellText = crudButton(td, val, "Delete");
      }
    }
    td.appendChild(cellText);
    tr.appendChild(td);
  });

  resultEl.appendChild(tr);
}

/* Reset Table DOM rows */
function resetTable() {
  let tableEl = document.getElementById("result"),
    tableHead = tableEl.querySelector("thead"),
    tableExistingRows = tableEl.querySelectorAll(":scope > tr");

  if (tableExistingRows && tableExistingRows.length) {
    while (tableEl.firstChild) {
      tableEl.removeChild(tableEl.firstChild);
    }
  }
  tableEl.appendChild(tableHead);
}

/* Passed values to DOM  */
function outputVal(data) {
  /* Reset existing row to the DOM */
  resetTable();

  /* Loop through new data  */
  if (!(data instanceof Array)) {
    loopRow(data);
  } else {
    data.forEach(val => loopRow(val));
  }

  /* Add listener to DOM button  */
  crudButtonListener(".edit-item", "edit", "click");
  crudButtonListener(".delete-item", "delete", "click");
}

/* Output values to fields */
function valToFields(dataObj) {
  setInputVal("idnum", dataObj.idnum);
  setInputVal("name", dataObj.name);
  setInputVal("numGuest", dataObj.numGuest);
  setInputVal("dateFrom", dataObj.dateFrom);
  setInputVal("dateTo", dataObj.dateTo);
}

/* CRUD button handler */
function crudButtonHandler(e, state, selector) {
  e.preventDefault();
  const dataArr = fetchLocalStorageVal("formVal");
  const selectorId = selector.split("-")[1];
  let filteredData;

  if (state == "edit") {
    filteredData = dataArr.find(item => item.idnum == selector.split("-")[1]);
    valToFields(filteredData);
  } else {
    filteredData = dataArr.filter(item => {
      return +item.idnum !== +selectorId;
    });
    saveToLocalStorage("formVal", filteredData);
    outputVal(filteredData);
  }
}

/* CRUD button listener */
function crudButtonListener(selector, state, event) {
  const allInput = document.querySelectorAll(selector);
  allInput.forEach(field => {
    document
      .getElementById(field.getAttribute("id"))
      .addEventListener(event, e => {
        crudButtonHandler(e, state, field.getAttribute("id"));
      });
  });
}
