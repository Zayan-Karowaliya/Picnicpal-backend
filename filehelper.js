import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    // Use the original file name with a timestamp to avoid overwriting
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});


  
  export const upload = multer({ storage: storage });