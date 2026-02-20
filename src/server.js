import http from "node:http";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

const server = http.createServer(app);

server.listen(port, () => {
  process.stdout.write(`Money Tracker API listening on http://localhost:${port}\n`);
});
