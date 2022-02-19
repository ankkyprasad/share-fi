const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const fileRouter = require("./routes/files");
// const emailRouter = require("./routes/email");

require("./db/mongoose");

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/files", fileRouter);
// app.use("/mail", emailRouter);

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("hi");
});

app.listen(PORT, () => {
  console.log("Running on server", PORT);
});
