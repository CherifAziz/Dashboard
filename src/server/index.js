require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const googlerouter = require("./services/google.js");
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 8080, () => {
  console.log("listening on port 8080");
});

app.use("/google", googlerouter);
