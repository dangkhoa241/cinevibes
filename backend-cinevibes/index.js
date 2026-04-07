import express from 'express'
import dotenv from 'dotenv'

dotenv.config()


const app = express()
app.use(express.json())
app.use(express.static('dist'))


const port = process.env.PORT || 3002
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})