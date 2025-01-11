// ==UserScript==
// @name        PSUT Plan Enhancer - psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/StudentStudyPlan.aspx
// @grant       none
// @version     3.0
// @author      Mo Mansour
// @description 7/24/2023, 10:14:37 PM:
//  A simple script to add some styling and functionalities to PSUT's study plan page.
//  Current Features:
//  - Different colors for passed, registered, and remaining courses
//  - Checkboxes to select courses, highlighted with a different color (useful while registering for a new semester)
//  - A flaoting box that keeps track of credits hours of the selected courses
//  - Saves selected courses to localStorage
// ==/UserScript==

if (location.pathname === "/StudentServices/StudentStudyPlan.aspx") {
  // only on the study plan page
  const colors = {
    registered: "aqua",
    passed: "bisque",
    selected: "#f3f713",
    base: "#f1f1f1",
    primary: "#006699",
  };
  const strings = {
    reg: {
      ar: "مسجله",
      en: "Registered",
    },
    pass: {
      ar: "ناجح",
      en: "Pass",
    },
    not_confirmed: {
      en: "Not Confirmed",
      ar: "غير معتمدة",
    },
  };
  let credits = {
    passed: 0,
    registered: 0,
    selected: 0,
  };
  let selectedCourses = [];
  const STORAGE_KEY = "selected_courses";

  let storedCourses;
  try {
    storedCourses = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    console.error("Error while retrieving stored courses:\n", e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    storedCourses = [];
  }

  // get rows of the study plan
  const allTrs = document.getElementsByTagName("tr"); // select all <tr> elements in the document because the layout and semantics of the page is beyond dogshit
  const rows = Object.keys(allTrs)
    .filter(
      // filter them to include only the rows for courses
      (row) => /^\d{5}$/.test(allTrs[row].cells[0].innerText)
    )
    .map((el) => allTrs[el]); // regex for courseID (5 digits)

  // get rows of registered courses
  const registered = Object.keys(rows)
    .filter(
      (row) =>
        // (rows[row].innerText.includes(strings.reg.ar) || rows[row].innerText.includes(strings.reg.en)) &&
        rows[row].innerText.includes(strings.not_confirmed.en) ||
        rows[row].innerText.includes(strings.not_confirmed.ar)
    )
    .map((el) => rows[el]);

  // get rows of the passed courses
  const passed = Object.keys(rows)
    .filter(
      (row) =>
        rows[row].innerText.includes(strings.pass.ar) ||
        rows[row].innerText.includes(strings.pass.en)
    )
    .map((el) => rows[el]);

  // Credit hours counter
  let chStyle = {
    position: "sticky",
    width: "max-content",
    height: "max-content",
    padding: "1rem",
    border: "1px solid grey",
    bottom: "10px",
    left: "10px",
    color: colors.primary,
    display: "flex",
    "background-color": colors.selected,
    "justify-content": "center",
    "align-items": "start",
    "flex-direction": "column",
    "font-size": "20px",
    "border-radius": "10px",
  };
  chStyle = Object.keys(chStyle)
    .map((p) => `${p}: ${chStyle[p]}`)
    .join(";");
  document.querySelector("body").insertAdjacentHTML(
    "beforeend",
    `<div style='${chStyle}'>
        <span style='font-weight: 600; margin-bottom: 1rem'>Credits</span>
        <div>Passed:      <span id='passed-chs-count'>  ${credits.passed}  </span></div>
        <div>Registered:  <span id='registered-chs-count'>  ${credits.registered}  </span></div>
        <div>Selected:    <span id='selected-chs-count'>${credits.selected}</span></div>
      </div>`
  );

  // insert a checkbox in each row
  const tables = document.getElementsByClassName("GridViewStyle");
  Object.keys(tables)
    .map((t) => tables[t].getElementsByTagName("tr")[0])
    .forEach((tr) => tr.insertAdjacentHTML("beforeend", "<th>Select</th>"));
  rows.forEach((tr) => {
    tr.insertAdjacentHTML(
      "beforeend",
      '<td> <input class="course-select" type=checkbox style="width: 100%; scale: 1.5; cursor: pointer"/> </td>'
    );

    // listen for checkboxes changes
    const input = tr.querySelector("input.course-select");
    input.addEventListener("change", (e) => {
      if (e.target.checked) {
        credits.selected += Number(tr.cells[2].innerText); // credit hours of selected course
        tr.setAttribute("style", `background-color: ${colors.selected};`);
        selectedCourses.push(tr.cells[0].innerText);
      } else {
        credits.selected -= Number(tr.cells[2].innerText);
        tr.setAttribute("style", `background-color: ${colors.base};`);
        const idx = selectedCourses.indexOf(tr.cells[0].innerText);
        if (idx !== -1) {
          // remove course
          selectedCourses.splice(idx, 1);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCourses));
      document.getElementById("selected-chs-count").innerText =
        credits.selected;
    });
    if (storedCourses && storedCourses.includes(tr.cells[0].innerText)) {
      input.click(); // triggers the event listener above
    }
  });

  registered.forEach((tr) => {
    // set background color for registered courses
    tr.setAttribute("style", `background-color: ${colors.registered};`);

    const checkbox = tr.querySelector("input");
    checkbox.setAttribute("disabled", true);
    checkbox.setAttribute("checked", true);

    credits.registered += Number(tr.cells[2].innerText);
  });

  passed.forEach((tr) => {
    // set background color for passed courses
    tr.setAttribute("style", `background-color: ${colors.passed};`);

    const checkbox = tr.querySelector("input");
    checkbox.setAttribute("disabled", true);
    checkbox.setAttribute("checked", true);

    credits.passed += Number(tr.cells[2].innerText);
  });
  // update registered and passed credits
  document.getElementById("registered-chs-count").innerText =
    credits.registered;
  document.getElementById("passed-chs-count").innerText = credits.passed;
}
