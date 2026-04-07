import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import Worker from "../models/worker.model.js"

export const protectRoute = async (req,res,next) => {
    try{
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({message: "Unauthorized : No token provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({message: "Unauthorized : Invalid  token"})
        }

        let account
        if(decoded.role=="user"){
            account = await User.findById(decoded.id).select("-password")

            if(!account){
                return res.status(404).json({message: "User not found"})
            }
        }
        
        if(decoded.role=="worker"){
            account = await Worker.findById(decoded.id).select("-password")

            if(!account){
                return res.status(404).json({message: "Worker not found"})
            }
        }
        req.user = account
        req.role = decoded.role
        
        next()
    }
    catch(error){
        console.log(`Error in protect route middleware: ${error.message}`)
        return res.status(500).json({message: "Internal server error"})
    }
}