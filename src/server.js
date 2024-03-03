//const express = require('express');
//const {engine: exphbs} = require('express-handlebars');
//const path = require("path");
//const tcpPortUsed = require('tcp-port-used');
//app.use(require("./routes/index"));
//import debug from "debug";
import express from "express";
import cors from "cors";
import { engine as exphbs } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { normalizePort } from "./helpers/index.js";
import * as routes from "./routes/index.js";
import httpError from "./httpError.js";

//const log = debug("server");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = normalizePort(process.env.PORT || "3000");
const V1 = /^\/V1/;
const V2 = /^\/V1/;
const V1_2 = /^\/V[1-2]/;

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({origin: "http://localhost:4200"}));

// Routes
app.use(V1, routes.documentRouter);
app.use(V1, routes.usersRouter);
app.use(V1, routes.collectionsRouter);
app.use(V1, routes.accountsRouter);
app.use(V1, routes.renderingsRouter);

// Middleware to process errors

app.use(httpError);

// Static assets

app.use(express.static(path.join(__dirname, "/public")));

// module.exports = app;
export default app;

