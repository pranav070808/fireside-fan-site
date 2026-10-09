# Fireside — fan-made Fireship field guide

Fireside is an independent, fan-made appreciation site for Fireship. It is not affiliated with or endorsed by Fireship or its owners.

## Run locally

Requires Node.js 18 or newer; no package installation is needed.

```sh
npm start
```

Open `http://localhost:3000`. The home and Field notes pages are connected through the shared navigation. The home page signup posts to `/api/subscribe`; valid entries are stored in `data/subscribers.json`, which is excluded from version control. To inspect submissions for a local demo, open that file on the server machine.

## Deploy on Render

The included `render.yaml` configures a free Node web service. In Render, create a Blueprint from this public repository and deploy it; Render builds with `npm install`, starts with `npm start`, and checks `GET /health`. The live service receives a public `onrender.com` URL.

The signup form transmits data to the Node backend and saves it in `data/subscribers.json`. Render's free service filesystem is temporary, so signup records can be lost when the service restarts or redeploys. For a real newsletter or long-term storage, connect a database or persistent storage and configure `DATA_DIR` to its mount path. The form does not send confirmation emails.

Before collecting real visitor information, add an appropriate privacy notice and retention process. The current signup is a working, self-hosted demo backend; it does not send a confirmation email or newsletter. For a public launch, connect an email delivery/list provider or build an admin workflow, then set up HTTPS and a persistent database.

