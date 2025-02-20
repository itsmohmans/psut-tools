// ==UserScript==
// @name        PSUT Schedule Exporter psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/StudentStudySchedule.aspx*
// @grant       none
// @version     1.0
// @author      Mo Mansour
// @description 20/02/2025, 19:37:12
//  - A script to export your current schedule to an ics file (which can be imported into a calendar app)
// ==/UserScript==

(function () {
  "use strict";

  const strings = {
    online: "Online",
    days: {
      en: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      ar: [
        "الاحد",
        "الاثنين",
        "الثلاثاء",
        "الاربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ],
    },
    multiDays: {
      en: ["Sun", "Mon", "Tues", "Wednes", "Thur"],
      ar: ["ح", "ن", "ث", "ر", "خ"],
    },
  };
  // const isEnglish = getCookieValue("lang") === "en-GB";
  const obj2CSS = (obj) =>
    Object.keys(obj)
      .map((p) => `${p}: ${obj[p]}`)
      .join(";");

  function getDayIndex(day, multiDay) {
    for (let lang of ["ar", "en"]) {
      const index = multiDay
        ? strings.multiDays[lang].indexOf(day)
        : strings.days[lang].indexOf(day);
      if (index !== -1) return index;
    }
    return -1;
  }

  function parseTime(timeStr) {
    const [start, end] = timeStr.split(/\s+/).map((t) => {
      const [hour, minute] = t.split(":");
      return new Date(0, 0, 0, hour, minute);
    });
    return { start, end };
  }

  function generateIcsContent(courses) {
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PSUT Schedule Exporter//EN",
    ];

    courses.forEach((course) => {
      const {
        title,
        id,
        section,
        instructor,
        classroom,
        days,
        time,
        isOnline,
      } = course;
      const { start, end } = parseTime(time);
      const eventTitle = `${isOnline ? "" : "[" + classroom + "]"} ${title}`;
      const eventDescription = `${title}, ${id}, section ${section}, ${classroom}, ${instructor}`;

      days.split(" ").forEach((day) => {
        const dayIndex = getDayIndex(day, days.split(" ").length > 1);
        if (dayIndex === -1) return;

        const startDate = new Date();
        startDate.setDate(
          startDate.getDate() + ((dayIndex - startDate.getDay() + 7) % 7)
        );
        startDate.setHours(start.getHours(), start.getMinutes(), 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(end.getHours(), end.getMinutes(), 0, 0);

        icsContent.push(
          "BEGIN:VEVENT",
          `DTSTART:${
            startDate.toISOString().replace(/[-:]/g, "").split(".")[0]
          }Z`,
          `DTEND:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
          `RRULE:FREQ=WEEKLY;BYDAY=${
            ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][dayIndex]
          }`,
          `SUMMARY:${eventTitle}`,
          `DESCRIPTION:${eventDescription}`,
          "END:VEVENT\n"
        );
      });
    });

    icsContent.push("END:VCALENDAR");
    return icsContent.join("\n");
  }

  function downloadIcsFile(content) {
    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function extractCourses() {
    const courses = [];
    const rows = document.querySelectorAll(
      "#ContentPlaceHolder1_gvStudentStudySchedule tr.GridViewRowStyle, #ContentPlaceHolder1_gvStudentStudySchedule tr.GridViewAlternateRowStyle"
    );

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const course = {
        id: cells[0].querySelector("span").innerText,
        title: cells[1].querySelector("span").innerText,
        section: cells[3].querySelector("span").innerText,
        instructor: cells[4].querySelector("span").innerText,
        classroom: cells[5].querySelector("span").innerText,
        days: cells[6].querySelector("span").innerText,
        time: cells[7].querySelector("span").innerText,
        isOnline: cells[8].querySelector("span").innerText === strings.online,
      };
      courses.push(course);
    });

    return courses;
  }

  function addExportButton() {
    const printButton = document.getElementById(
      "ContentPlaceHolder1_BtnPrintSch"
    );

    if (printButton) {
      const exportButton = document.createElement("a");
      exportButton.innerText = "Export to Calendar";
      exportButton.className = "export-btn";
      exportButton.setAttribute(
        "style",
        obj2CSS({
          padding: "5px 5%",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          width: "auto",
          display: "inline-block",
          "margin-left": "10px",
          "background-color": "#006699",
          "border-radius": "5px",
          "font-size": "17px",
          "text-align": "center",
          "text-decoration": "none",
        })
      );

      const style = document.createElement("style");
      style.textContent = `
      .export-btn:hover {
        background-color: #004466 !important;
      }`;
      document.head.appendChild(style);

      exportButton.addEventListener("click", () => {
        const courses = extractCourses();
        const icsContent = generateIcsContent(courses);
        downloadIcsFile(icsContent);
      });

      printButton.insertAdjacentElement("afterend", exportButton);
    } else {
      console.error("Print button not found!");
    }
  }

  addExportButton();
})();
