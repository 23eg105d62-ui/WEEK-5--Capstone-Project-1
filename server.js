import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { userRoute } from "./APIS/userApi.js";
import { commonRouter } from "./APIS/CommonApi.js";
import cookieParser from "cookie-parser";
import { adminRoute } from "./APIS/AdminApi.js";
import { authorRoute } from "./APIS/AuthorApi.js";

config(); //process.env

//Create express application
const app = exp();
//add body parser middleware
app.use(exp.json());
//add cookie parser middleware
app.use(cookieParser())
//connect APIs
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connection success");

    //start http server
    app.listen(process.env.PORT, () => console.log(`server started on port ${process.env.PORT}`));
  } catch (err) {
    console.log("Err in DB connection", err);
  }
};

connectDB();

//logout for User, Author and Admin



//dealing with invalid path
app.use((req, res, next) => {
  console.log(req.url)
  res.json({ message: `${req.url}Invalid path` })
})

//error handling middleware
app.use((err, req, res, next) => {
  console.log("err:", err)
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message })
});
