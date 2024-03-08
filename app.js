require("dotenv").config();
const express = require("express");
const connnectToDB = require("./database");
const { authUser, checkUser } = require("./middleware/authMiddleware");
const authRouter = require("./routes/authRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

const port = 3000;

//setting the view engine
app.set("view engine", "ejs");

//setting the views directory
app.set("views", path.join(__dirname, "views"));

//setting the public folder
app.use(express.static(path.join(__dirname, "public")));

// connection mongodb
connnectToDB(app);

// using body parser
app.use(express.json());

// for cookies
app.use(cookieParser());

// in all get request i want to check user
app.get("*",checkUser);


app.get("/", (req, res) => {
  res.render("home.ejs", { title: "Home" });
});

app.get("/protected", authUser, (req, res) => {
  res.render("protected.ejs", { title: "Protected" });
});

app.use("/user", authRouter);

// app.use((err,req,res,next)=>{
//     res.status(500).send("Internal Server Error!!");
// });
