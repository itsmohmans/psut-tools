// ==UserScript==
// @name        Better PSUT Exams View - psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/StudentExamSchedule.aspx
// @grant       none
// @version     1.0
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
const obj2CSS = (obj) => Object.keys(obj).map(p => `${p}: ${obj[p]}`).join(';')

const colors = {
  pastExam: '#aaa',
  first: 'rgb(211, 229, 239)',
  midterm: 'rgb(219, 237, 219)',
  second: 'rgb(232, 222, 238)',
  final: 'rgb(255, 226, 221)',
}

const strings = {
  first: {
    ar: 'امتحان اول',
    en: 'First Exam',
  },
  midterm: {
    ar: 'امتحان منتصف الفصل',
    en: 'Mid Exam',
  },
  second: {
    ar: 'امتحان الثاني',
    en: 'Second Exam',
  },
  final: {
    ar: 'امتحان نهائي',
    en: 'Final Exam',
  },
};

const EXAMS_URL = '/StudentServices/StudentExamSchedule.aspx';

const main = () => {
  const examsTableBody = document.querySelector('#ContentPlaceHolder1_gvStudentExamSchedule > tbody')

  for (let i = 1; i < examsTableBody.childElementCount; i++) {
    const currentExam = examsTableBody.childNodes[i];
    // get and style exam type
    const examTypeString = currentExam.childNodes[1].innerText
    const examTypeKey =
      Object.keys(strings)
      .find(key => strings[key].en === examTypeString || strings[key].ar === examTypeString)

    if (examTypeKey) {
      let style = {
        'background-color': colors[examTypeKey],
        'border-radius': '4px',
        color: '#01618F',
        padding: '4px',
      }
      currentExam.childNodes[1].querySelector('span').setAttribute('style', obj2CSS(style));
    } else {
      console.error(`Exam type not found: ${examTypeString}`);
    }

    // get exam date
    const examDate = currentExam.childNodes[2].innerText?.split('-');
    const date = {
      year: parseInt(examDate[2], 10),
      month: parseInt(examDate[1], 10) - 1,
      day: parseInt(examDate[0], 10),
    };
    const parsedDate = new Date(date.year, date.month, date.day);
    if (parsedDate < new Date()) {
      let style = {
        'background-color': colors.pastExam,
        color: 'white',
      }
      currentExam.setAttribute('style', obj2CSS(style))
    }
  }
}

if (location.pathname === EXAMS_URL) {
  main()
}
