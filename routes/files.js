const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuid4 } = require("uuid");

const File = require("../models/file");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  // 100 mb file limit
  limits: {
    fileSize: 100000000,
  },
}).single("file");

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    // validate request

    if (!req.file) {
      return res.status(400).json({
        error: "File not sent",
      });
    }

    if (err) {
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
      });
    }

    // store into database

    const file = new File({
      fileName: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();

    console.log(file);

    // response -> link

    return res.json({
      title: "file saved",
      id: response.uuid,
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
});

router.get("/:uuid", async (req, res) => {
  const id = req.params.uuid;

  try {
    const file = await File.findOne({ uuid: id });

    if (!file) throw new Error("File not found");

    return res.json({
      title: "Success",
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
    });
  } catch (err) {
    return res.status(400).json({
      title: "error occured",
      message: err.message,
    });
  }
});

router.get("/download/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });

    if (!file) throw new Error("File not found");

    const filePath = `${__dirname}/../${file.path}`;

    res.download(filePath);
  } catch (err) {
    return res.status(400).json({
      title: "Error",
      message: err.message,
    });
  }
});

module.exports = router;
