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
            email: user.email,
            rollno: user.rollno
        })
    }
    catch(error){
        console.log(`Error in registering user : ${error}`)
        return res.status(500).json({message: "Internal error in registering user"})
    }
}

export const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status({message: "Email and password are required"})
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "Invalid credentials"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"})
        }

        generateToken(user._id, "user", res)

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            rollno: user.rollno
        })
    }
    catch(error) {
        console.log(`Error in user login : ${error}`)
        return res.status(500).json({message: "Internal error in user login"})
    }
}

export const logoutUser = async(req, res) => {
    try{
        res.cookie("jwt","",{maxAge: 0})
        return res.status(200).json({message: "Logged out successfully"})
    }
    catch(error){
        console.log(`Error in user logout : ${error}`)
        return res.status(500).json({message: "Internal error in user logout"})
    }
}