import bcrypt from 'bcryptjs'
import Worker from "../models/worker.model.js"
import { generateToken } from '../lib/utils.js'

export const loginWorker = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"})
        }

        const worker = await Worker.findOne({email})
        if(!worker){
            return res.status(400).json({message: "Invalid credentials"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, worker.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"})
        }

        generateToken(worker._id, "worker", res)

        return res.status(200).json({
            _id: worker._id,
            name: worker.name,
            email: worker.email,
            workerId: worker.workerId
        })
    }
    catch(error){
        console.log(`Error in worker login : ${error}`)
        return res.status(500).json({message: "Internal error in worker login"})
    }
}