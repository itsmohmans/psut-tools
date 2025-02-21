# Schedule Exporter

This script adds a button to export your current schedule to an ics file, which can be imported into a calendar app like Google Calendar.

## How to use

The easiest way to run this script is to install a user script browser extension like [Violentmonkey](https://violentmonkey.github.io/get-it/) (recommended) or [Tampermonkey](https://www.tampermonkey.net/index.php?browser=chrome).
After installing any of these extensions, you can add [`main.user.js`](https://github.com/itsmohmans/psut-tools/blob/main/schedule-exporter/main.user.js) as a user script.
In Violentmonkey for example:

1. go to extension settings
2. click on the `+` icon on the top left
3. from here, you can either select `New` and copy my script and paste it directly in the extension, or
4. select `Install from URL` and paste this Github raw url <https://github.com/itsmohmans/psut-tools/raw/refs/heads/main/schedule-exporter/main.user.js> (or you can just open the link and it'll ask you to install it)
5. go to your [current schedule page on PSUT Portal](https://portal.psut.edu.jo:5050/StudentServices/StudentStudySchedule.aspx) and you'll see the new export button below the table
