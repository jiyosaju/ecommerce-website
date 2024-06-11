const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
//const path=require("path")
const cors = require("cors");
const connectDB = require("./server/database/db");
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes


app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);


app.use(express.json());

//log reqest
app.use(morgan("tiny"));

//mongodb connection
connectDB();


app.use(cookieParser());

//parse req to body-parser
app.use(bodyparser.urlencoded({ extended: true }));

//set view engine
//app.set("view engine",'ejs');
//app.set("views",path.join(__dirname,"views"))  //ejs aanel ee two codes mathiii  view engine il html ine pakaram ejs aakkanm
//app.engine('html',require('ejs').renderFile); //this 3 codes for setting html file

//load assests
// app.use('/css',express.static(path.resolve(__dirname,"assest/css")))
// app.use("/img", express.static(path.resolve(__dirname, "assest/images")));
// app.use("/js", express.static(path.resolve(__dirname, "assest/css")));

//load routers
app.use("/", require("./server/routes/router"));

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
