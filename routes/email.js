const router = require("express").Router();
const File = require("../models/file");

const sendMail = require("../utils/sendEmail");

router.get("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;

  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).json({
      title: "Error has occured!",
      message: "All field has required",
    });
  }

  const file = await File.findOne({ uuid });

  if (!file) {
    return res.status(400).json({
      title: "Error has occured!!",
      message: "File not found",
    });
  }

  // if (file.sender) {
  //   return res.status(400).json({
  //     title: "Email already Sent",
  //   });
  // }

  file.sender = emailFrom;
  file.receiver = emailTo;

  await file.save();

  //   send email

  const fileData = {
    downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
    size: parseInt(file.size / 1000) + " KB",
    expires: "24 hours",
  };

  sendMail(emailFrom, emailTo, "sharing file", fileData);

  res.json({
    title: "Success",
    message: "Mail Sent!",
  });
});

module.exports = router;
