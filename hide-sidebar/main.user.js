// ==UserScript==
// @name        Hide Sidebar - psut.edu.jo
// @namespace   Violentmonkey Scripts
// @match       https://portal.psut.edu.jo:5050/StudentServices/*
// @grant       none
// @version     1.0
// @author      Mo Mansour
// @description 12/04/2023, 04:35:37 PM:
//  A simple script to hide and show the sidebar.
// ==/UserScript==

const obj2CSS = (obj) =>
    Object.keys(obj)
        .map((p) => `${p}: ${obj[p]}`)
        .join(";");
    
const getCookieValue = (cookieName) => {
    let cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }

    return null;
}

const BURGER_ICON_URL = 'https://api.iconify.design/ion:md-menu.svg'

const main = () => {
    const isEnglish = getCookieValue('lang') === 'en-GB'

    const sidebar = document.getElementById("sideMenuDisk")
    const btn = sidebar.insertAdjacentElement("afterbegin", document.createElement('button'));
    let isOpen = true

    btn.setAttribute(
        "style",
        obj2CSS({
            position: "relative",
            left: isEnglish ? "200px" : "-200px",
            padding: "1px",
            width: "36px",
            "border-start-end-radius": 0,
            "border-start-start-radius": 0,
        })
    );
    const img = btn.insertAdjacentElement('afterbegin', document.createElement('img'))
    img.setAttribute('src', BURGER_ICON_URL)
    img.setAttribute('style', 'width: 100%')

    btn.addEventListener('click', (e) => {
        e.preventDefault()
        if (isOpen) {
            isOpen = false
            sidebar.setAttribute(
                "style",
                obj2CSS({
                    position: "absolute",
                    transform: isEnglish ? "translateX(-190px)" : "translateX(190px)",
                    transition: '500ms all',
                    "z-index": 20
                })
            );
        }
        else {
            isOpen = true
            sidebar.style.transform = "translateX(0)"
        }
    })
};

main()
