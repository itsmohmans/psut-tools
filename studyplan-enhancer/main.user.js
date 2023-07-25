// ==UserScript==
// @name        PSUT Plan Enhancer - psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/StudentStudyPlan.aspx
// @grant       none
// @version     1.0
// @author      Mo Mansour
// @description 7/24/2023, 10:14:37 PM:
//  A simple script to add some styling and functionalities to PSUT's study plan page.
//  Current Features:
//  - Different colors for passed, registered, and remaining courses
//  - Checkboxes to select courses, highlighted with a different color
//  - A flaoting box that keeps track of credits hours of the selected courses
// ==/UserScript==

if (location.pathname === '/StudentServices/StudentStudyPlan.aspx') { // only on the study plan page
  const colors = {
    registered: 'aqua',
    passed: 'bisque',
    selected: 'aquamarine',
    base: '#f1f1f1',
    primary: '#006699'
  }
  const strings = {
    reg: {
      ar: 'مسجله',
      en: 'Registered'
    },
    pass: {
      ar: 'ناجح',
      en: 'Pass'
    }
  }
  let credits = 0; // selected credit hours

  // get rows of the study plan
  const allTrs = document.getElementsByTagName('tr') // select all <tr> elements in the document because the layout and semantics of the page is beyond dogshit
  const rows = Object.keys(allTrs).filter( // filter them to include only the rows for courses
    row => /^\d{5}$/.test(allTrs[row].cells[0].innerText)).map(el => allTrs[el]) // regex for courseID (5 digits)

  // get rows of registered courses
  const registered = Object.keys(rows).filter(
    row => rows[row].innerText.includes(strings.reg.ar) || rows[row].innerText.includes(strings.reg.en)).map(el => rows[el])

  // get rows of the passed courses
  const passed = Object.keys(rows).filter(
    row => rows[row].innerText.includes(strings.pass.ar) || rows[row].innerText.includes(strings.pass.en)).map(el => rows[el])

  // insert a checkbox in each row
  const tables = document.getElementsByClassName('GridViewStyle')
  Object.keys(tables)
    .map(t => tables[t].getElementsByTagName('tr')[0])
    .forEach(
      tr => tr.insertAdjacentHTML('beforeend', '<th>Check</th>')
    )
  rows.forEach(tr => {
    tr.insertAdjacentHTML(
      'beforeend',
      '<td> <input type=checkbox style="width: 100%; scale: 1.5; cursor: pointer"/> </td>'
    )
    // listen for checkboxes changes
    tr.querySelector('input').addEventListener('change', (e) => {
      const ch = document.getElementById('chs-count')
      if (e.target.checked) {
        credits += Number(tr.cells[2].innerText) // credit hours of selected course
        tr.setAttribute('style', `background-color: ${colors.selected};`)
      }
      else {
        credits -= Number(tr.cells[2].innerText)
        tr.setAttribute('style', `background-color: ${colors.base};`)
      }
      ch.innerText = credits
    })
  })

  // set background color for registered courses
  registered.forEach(tr => {
    tr.setAttribute('style', `background-color: ${colors.registered};`)
    const checkbox = tr.querySelector('input')
    checkbox.setAttribute('disabled', true)
    checkbox.setAttribute('checked', true)
  })

  passed.forEach(tr => {
    // set background color for passed courses
    tr.setAttribute('style', `background-color: ${colors.passed};`)

    const checkbox = tr.querySelector('input')
    checkbox.setAttribute('disabled', true)
    checkbox.setAttribute('checked', true)
  })

  // Credit hours counter
  let chStyle = {
    position: 'sticky',
    width: 'max-content',
    height: '50px',
    padding: '1rem',
    border: '1px solid grey',
    bottom: '10px',
    left: '10px',
    color: colors.primary,
    display: 'flex',
    'background-color': colors.selected,
    'justify-content': 'center',
    'align-items': 'center',
    'flex-direction': 'column',
    'font-size': '20px',
    'border-radius': '100px',
  }
  chStyle = Object.keys(chStyle).map(p => `${p}: ${chStyle[p]}`).join(';')
  document.querySelector('body')
    .insertAdjacentHTML(
      'beforeend',
      `<div style='${chStyle}'>Selected Credits<span id='chs-count' style='display: block'>${credits}</span></div>`
    )

}
