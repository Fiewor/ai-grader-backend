const express = require('express')
const fileUpload = require('express-fileupload')
// const multer = require("multer");
const app = express()
const port = process.env.PORT || 3001
// const path = require('path')

app.use(fileUpload())

let allowCrossDomain = function(req, res, next){
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Tpye');
    next();
}
app.use(allowCrossDomain)

// handle uploads:
// const uploadStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/'); //store in uploads dir
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); //Appending extension because multer doesn't do it by default, doh
//     }
// });

// const upload = multer({ storage: uploadStorage });

app.get('/', (req, res) => {
  res.send('Working')
})

app.post('/login', (req, res) => {
  res.send('login working!')
})

app.post('/upload', (req, res) => {
//   console.log(req.files.name)
  let file
  let uploadPath

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  file = req.files.file
  console.log(file)
  uploadPath = __dirname + '/uploads' + file.name
  console.log(uploadPath)

  //  the mv() method is used to place the file somewhere on the server
  file.mv(uploadPath, err => {
    if (err) {
      return res.status(500).send(err)
    }
    res.send('File uploaded')
  })
})

// app.post('/upload', upload.single('uploaded_file'), (req, res) => {
//   console.log(req)
//   res.send('upload working!, check uploads folder in the project')
// })

app.listen(port, () => {
  console.log(`Server is started on port ${port}`)
})
