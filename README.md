# Iceman Coach Playbook

A digital playbook for football coaches, built for a tablet on the sideline.
Sister app to [Iceman QB Cards](https://github.com/qmcclellan/iceman-qb-cards): QB Cards is for players, this one is for coaches.

## What it does

- **Playbook:** add, edit, duplicate and delete plays. Each play has a name, side of ball, play type, formation, scheme, position-by-position assignments, coaching notes and an optional diagram.
- **Diagram editor:** start from a formation (Spread 2x2, Trips Right, I-Form, 4-3 Base, Nickel 4-2-5), then tap to add players, draw routes, drag players and erase. Routes move with their player.
- **Search and filter:** by text, side, play type, formation, scheme and position.
- **Call sheet:** plays grouped by situation (Openers, 3rd & short, Red zone and so on). Reorder, rename and add situations. Prints as a paper call sheet.
- **Game log:** tap a play on the call sheet to log the call with down, distance, result and yards. The review shows calls, yards, average, TDs and turnovers per play, for one game or all games.
- **Backup:** export everything to a JSON file and import it on any device.

Nine example plays (Smash, Mesh, Stick, Four Verticals, Inside Zone, Power, Bubble Screen, Cover 3 Sky, Cover 0 Blitz) load on first open. Backup > Reset to examples brings them back.

## How it's built

Plain HTML, CSS and JavaScript in one file (`index.html`), the same approach as QB Cards. No build step, no server and no database.
Data is saved in the browser (`localStorage`, key `coachapp.v1`) on whatever device is used. Clearing the browser or switching devices loses it, so export a backup now and then.

## Run it locally

Any static file server works. From the repo folder:

```
python3 -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` straight from disk also works.

## Hosting and feedback (planned)

- **Hosting:** AWS free tier as a static site (S3 + CloudFront, or Amplify Hosting). Nothing in the app depends on the host.
- **Feedback:** one shared AWS Lambda behind API Gateway, storing to DynamoDB, used by both this app and QB Cards. When it exists, set `FEEDBACK_URL` near the top of the script in `index.html` and the footer's "Feedback (coming soon)" button turns into "Send feedback". It POSTs JSON: `{ app, message, screen, sent }`.

## Later

- Import playbooks (Hudl export, no video)
- Stats beyond yards per call
- Multiple teams

Nothing in this repo should ever hold a password, key or personal data. The repo is public.
