# Done — To-do list

A responsive, dependency-free to-do app built with HTML, CSS and JavaScript.

## Run

Install Node.js 18 or newer, then run `npm start` and open http://127.0.0.1:4173.
No package installation or build is required. Run `npm run check` to check JavaScript syntax.

## Features

- Add, edit, complete and delete tasks.
- Filter all, active or completed tasks and clear completed tasks.
- Progress indicator, keyboard controls and mobile layout.
- Browser-local persistence and updates between tabs.

Tasks are stored in localStorage on the current browser and origin. There is no account, server database or cross-device sync. Clearing browser data removes saved tasks. Storage failures display a warning. Task text is rendered as text, never HTML.

## Files

`dist/` contains the complete static website, ready for any static host. `server.cjs` is a local preview server bound to localhost. Where supported, the optional WebMCP `add_task` tool uses the same action as the form.
