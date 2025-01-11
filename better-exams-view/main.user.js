// ==UserScript==
// @name        Better PSUT Exams View - psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/StudentExamSchedule.aspx
// @match       https://portal.psut.edu.jo:5050/PageTemp/PageMoved1.aspx*
// @grant       GM_xmlhttpRequest
// @version     2.0
// @author      Mo Mansour
// @description 11/24/2023, 05:10:37 PM:
//  A simple script to make viewing your exams easier.
//  It styles previous exams with grey color and adds different colors to each exam type
//  to better skim through your exam schedule.
// ==/UserScript==

/**
 * @param obj is css properties as key-value pairs
 * @returns a valid css properties and values
 */
const obj2CSS = (obj) =>
  Object.keys(obj)
    .map((p) => `${p}: ${obj[p]}`)
    .join(";");

const colors = {
  pastExam: "#aaa",
  first: "rgb(211, 229, 239)",
  midterm: "rgb(219, 237, 219)",
  second: "rgb(232, 222, 238)",
  final: "rgb(255, 226, 221)",
};

const strings = {
  first: {
    ar: "امتحان اول",
    en: "First Exam",
  },
  midterm: {
    ar: "امتحان منتصف الفصل",
    en: "Mid Exam",
  },
  second: {
    ar: "امتحان الثاني",
    en: "Second Exam",
  },
  final: {
    ar: "امتحان نهائي",
    en: "Final Exam",
  },
};

const main = () => {
  "use strict";

  // get exams to put them in their og place
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://portal.psut.edu.jo/ExamStudent",
    onload: function (response) {
      console.log("Response status:", response.status);

      if (response.status === 200) {
        const mainContentBox = document
          .getElementById("ContentPlaceHolder1_ctl00")
          .querySelector(".mainContentBox");

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.responseText, "text/html");
        const appContentElement = doc.querySelector(".app-content.content");

        // remove select semester form
        const formElement = appContentElement.querySelector("#form0");
        if (formElement) {
          formElement.remove();
        }

        // style the exams table
        const tableElement = appContentElement.querySelector("table");

        if (tableElement) {
          tableElement.setAttribute(
            "style",
            obj2CSS({
              border: "1px solid grey",
              padding: "5px",
              margin: "0 auto",
              color: "#002C40",
              "border-collapse": "collapse",
              "background-color": "white",
            })
          );

          // style cells
          const tableCells = tableElement.querySelectorAll("td, th");
          tableCells.forEach((cell) => {
            cell.setAttribute(
              "style",
              obj2CSS({
                border: "1px solid grey",
                padding: "5px",
              })
            );
          });

          // style exams based on their date and type
          const today = new Date();
          const tableRows = tableElement
            .querySelector("tbody")
            .querySelectorAll("tr");
          tableRows.forEach((row) => {
            const dateCell = row.querySelectorAll("td")[1];
            if (dateCell?.innerText) {
              const dateStr = dateCell.textContent.trim();
              const [day, month, year] = dateStr.split("-").map(Number);
              const rowDate = new Date(year, month - 1, day);
              if (rowDate < today) {
                row.setAttribute(
                  "style",
                  obj2CSS({
                    color: "#d6d6d6",
                    "background-color": colors.pastExam,
                  })
                );
              }
            }

            const typeCell = row.querySelectorAll("td")[0];
            const typeText = typeCell?.innerText;
            if (typeText) {
              const examType = Object.keys(strings).find(
                (key) =>
                  strings[key].en === typeText || strings[key].ar === typeText
              );
              if (examType) {
                const typeBadge = document.createElement("span");
                typeBadge.innerText = typeText;
                typeBadge.setAttribute(
                  "style",
                  obj2CSS({
                    color: "#01618F",
                    padding: "4px",
                    "background-color": colors[examType],
                    "border-radius": "4px",
                  })
                );
                typeCell.innerHTML = "";
                typeCell.appendChild(typeBadge);
              }
            } else {
              console.error(`Exam type not found: ${typeText}, ${typeCell}`);
            }
          });
        }

        // replace content of the .mainContentBox element with the modified exams table
        if (mainContentBox && appContentElement) {
          mainContentBox.innerHTML = "";
          mainContentBox.appendChild(appContentElement);
        } else {
          console.error(
            "couldn't find the .mainContentBox or .app-content.content."
          );
        }
      } else {
        console.error(
          "Error fetching exams:",
          response.status,
          response.statusText
        );
      }
    },
    onerror: function (error) {
      console.error("Error requesting exams: ", error);
    },
  });
};
main();
