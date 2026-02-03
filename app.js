// Core Module
const path = require("path");

// External Module
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { default: mongoose } = require("mongoose");
const multer = require("multer");
require("dotenv").config();

//Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const cloudinaryStorage = require("./utils/cloudinary");

const app = express();
const DB_PATH = process.env.MONGODB_URI;

app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

app.use(express.urlencoded());
app.use(multer({ storage: cloudinaryStorage }).single("photo"));
app.use(express.static(path.join(rootDir, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

app.use(storeRouter);
// Throwing on login if anyone is accessing host pages without login
app.use("/host", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/auth/login");
  } else {
    next();
  }
});
app.use("/host", hostRouter);
app.use(authRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3001;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error while connecting to MongoDB: ", error);
  });
