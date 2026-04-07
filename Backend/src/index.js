import dotenv from 'dotenv'
dotenv.config({path: "./.env"})
import app from "./app.js"
import { connectDB } from './lib/db.js'

connectDB()
.then(() => {
    app.listen(process.env.PORT, ()=>{
        console.log(`Server running on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log(`MongoDB connection failed: ${error}`)
})
