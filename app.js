const express = require('express')
const multer = require("multer");
const app = express()
const port = process.env.PORT||3000
const path = require('path')

// handle uploads:
const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); //store in uploads dir
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); //Appending extension because multer doesn't do it by default, doh
    }
});

const upload = multer({storage: uploadStorage});




app.get('/', (req, res)=>{
    res.send(`Working`)
})

app.post('/login', (req, res)=>{
    res.send(`login working!`)
})
app.post('/upload', upload.single('uploaded_file'),(req, res)=>{
    res.send(`upload working!, check uploads folder in the project`)
})

app.listen(port, ()=>{
    console.log(`Server is started on port ${port}`)
})