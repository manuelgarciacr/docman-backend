//const express = require('express');
//const {engine: exphbs} = require('express-handlebars');
//const path = require("path");
//const tcpPortUsed = require('tcp-port-used');
//app.use(require("./routes/index"));
//import debug from "debug";
import express from "express";
import { engine as exphbs } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { normalizePort } from "./helpers/index.js";
import * as routes from "./routes/index.js";
import { renderRoute } from "./routes/render.js";

//const log = debug("server");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = normalizePort(process.env.PORT || "3000");

// Settings

app.set("port", port);
app.set("views", path.join(__dirname, "views"));
app.engine(
    "hbs",
    exphbs({
        layoutsDir: path.join(app.get("views"), "layouts"),
        partialsDir: path.join(app.get("views"), "partials"),
        defaultLayout: "main",
        extname: ".hbs",
    })
);
app.set("view engine", "hbs");

// Middleware

app.use(express.urlencoded({ extended: false }));

// Routes
app.use(routes.documentRouter);
app.use(renderRoute);

// Static assets

app.use(express.static(path.join(__dirname, "/public")));

// module.exports = app;
export default app;

