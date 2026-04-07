import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js' 
import User from "../models/user.model.js"

export const registerUser = async(req, res) => {
    try{
        const {name, email, password, rollno, grade, branch} = req.body

        if(!name || !email || !password || !rollno || !grade || !branch){
            return res.status(400).json({message: "All fields are required"})
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message: "User already exists"})
        }

        if(password.length<6){
            return res.status(400).json({message: "Password must be at least 6 characters"})
        }

        if(rollno.length!=9){
            return res.status(400).json({message: "Roll number must be of 9 digits"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            rollno,
            grade,
            branch
        })

        generateToken(user._id, "user", res)

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.name,
            rollno: user.rollno
        })
    }
    catch(error){
        console.log(`Error in registering user : ${error}`)
        return res.status(500).json({message: "Internal error in registering user"})
    }
}