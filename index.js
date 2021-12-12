const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send('Server is working!!')
})

const PORT = process.env.HOST || 3030

app.listen(PORT, () => {
    console.log(`listening on port ==> ${PORT}`)
})