# Fireside — fan-made Fireship field guide

Fireside is an independent, fan-made appreciation site for Fireship. It is not affiliated with or endorsed by Fireship or its owners.

## Run locally

Requires Node.js 18 or newer; no package installation is needed.

```sh
npm start
```

Open `http://localhost:3000`. The home and Field notes pages are connected through the shared navigation. The home page signup posts to `/api/subscribe`; valid entries are stored in `data/subscribers.json`, which is excluded from version control. To inspect submissions for a local demo, open that file on the server machine.

## Host it

Deploy this folder as a Node web service on a host that supports Node 18+ and persistent storage. Set the service start command to `npm start` and set `DATA_DIR` to the host's mounted persistent storage path so signups survive restarts and deploys. The server uses the `PORT` environment variable supplied by most hosts. `GET /health` returns a small health-check response.

Before collecting real visitor information, add an appropriate privacy notice and retention process. The current signup is a working, self-hosted demo backend; it does not send a confirmation email or newsletter. For a public launch, connect an email delivery/list provider or build an admin workflow, then set up HTTPS and a persistent database.

