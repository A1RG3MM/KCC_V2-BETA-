import express from "express";
import http from "node:http";
import path from "node:path";
import wisp from "wisp-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { hostname } from "node:os";

const app = express();
const __dirname = process.cwd();

app.use(express.static(path.join(__dirname, "static")));
app.set("view engine", "ejs");
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

app.use("/uv.bundle.js", express.static(path.join(uvPath, "uv.bundle.js")));
app.use("/uv.client.js", express.static(path.join(uvPath, "uv.client.js")));
app.use("/uv.handler.js", express.static(path.join(uvPath, "uv.handler.js")));
app.use("/uv.config.js", express.static(path.join(uvPath, "uv.config.js")));
app.use("/uv.sw.js", express.static(path.join(uvPath, "uv.sw.js")));

app.get("/", (req, res) => {
    res.render(path.join(__dirname, "files", "index.ejs"));
});

app.use((req, res) => {
    res.status(404);
    res.render(path.join(__dirname, "files", "404.ejs"));
});

const server = http.createServer();

server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    app(req, res);
});
server.on("upgrade", (req, socket, head) => {
    if (req.url.endsWith("/wisp/"))
        wisp.routeRequest(req, socket, head);
    else
        socket.end();
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 3000;

server.on("listening", () => {
    const address = server.address();
    console.log("Listening on:");
    console.log(`\thttp://localhost:${address.port}`);
    console.log(`\thttp://${hostname()}:${address.port}`);
    console.log(
        `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address
        }:${address.port}`
    );
});


function shutdown(reason) {
    if (!reason) reason = "Unknown reason"
    console.warn("Closing HTTP server: " + reason);
    server.close();
    process.exit(0);
}

server.listen({port});
