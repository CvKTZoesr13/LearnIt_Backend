require('dotenv').config({debug: true})

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const connectDB = async() => {
    try {   
        mongoose.set('strictQuery', true)
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-learnit.mnacoyn.mongodb.net/?retryWrites=true&w=majority`)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

const authRouter = require('./routes/auth.js')
const postRouter = require('./routes/post.js')

connectDB()
const app = express()
app.use(express.json())
app.use(cors())
app.get('/', (req, res) => res.send('Hello world'))

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
const PORT =  process.env.PORT||2002
app.listen(PORT,() => {
    console.log(`Server is running on PORT ${PORT}`)
})