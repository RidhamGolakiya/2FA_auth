require("dotenv").config();
require("./connection");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const authRoute = require("./routes/authRoute");
const seed = require("./seeder/seeder"); //default seed
const flash = require("connect-flash");
const morgan = require("morgan");
const path = require("path");

app.use(
  session({
    secret: "two_auth",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use(flash());
app.use(morgan("dev"));

app.use(authRoute);
seed.seedDefault(); //Defult seeder

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

module.exports = app;
