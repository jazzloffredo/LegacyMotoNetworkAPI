var cookieParser = require("cookie-parser");
var cors = require("cors");
var express = require("express");
var logger = require("morgan");
var path = require("path");
var session = require("express-session");

var MemoryStore = require("memorystore")(session);

var nconf = require("./config");

require("dotenv").config();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//  Session setup
app.use(
  session({
    secret: process.env.SECRET_KEY,
    cookie: {
      maxAge: 86400000,
      secure: false,
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    saveUninitialized: true,
    resave: false,
    unset: "destroy",
  })
);

// cors
app.use(
  cors({
    methods: "GET,PUT,PATCH,POST,DELETE",
    origin: ["http://localhost:8080", "https://localhost:8080"],
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: "204",
    credentials: true,
    /* preflightContinue: false, */
  })
);

// routers
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var usersRouter = require("./routes/users");
var groupsRouter = require("./routes/groups");
var postsRouter = require("./routes/posts");

// define routes
app.use(nconf.get("api_path") + "/", indexRouter);
app.use(nconf.get("api_path") + "/auth", authRouter);
app.use(nconf.get("api_path") + "/user", usersRouter);
app.use(nconf.get("api_path") + "/group", groupsRouter);
app.use(nconf.get("api_path") + "/post", postsRouter);

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  if (res.headersSent) {
    return next(err);
  } else {
    res.status(err.status || 500).json({ error: err });
  }
});

module.exports = app;
