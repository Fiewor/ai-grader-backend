const express = require('express')

const app = express()
const port = process.env.PORT||3000

app.get('/', (req, res)=>{
    res.send(`Working`)
})

app.post('/login', (req, res)=>{
    res.send(`login working!`)
})
app.post('/upload', (req, res)=>{
    console.log(req.body)
    res.send(`upload working!`)
})

app.listen(port, ()=>{
    console.log(`Server is started on port ${port}`)
})