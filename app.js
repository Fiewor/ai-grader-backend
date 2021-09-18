const express = require('express')
const app = express()
const port = process.env.PORT||3001
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.get('/', (req, res)=>{
    res.send(`Working`);
})

app.post('/login', (req, res)=>{
    res.send(`login working!`);
})
app.post('/upload',(req, res)=>{
    for(let file of Object.values(req.files)) {
        let pathToFile = __dirname + "/uploads/" + file.name;

        file.mv(pathToFile, (err) => {
            if (err) {
                console.log('and error is ', err);
            }
        });
    }

    res.send(`upload working!, check uploads folder in the project`);
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
})
