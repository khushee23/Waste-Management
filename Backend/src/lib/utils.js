import jwt from "jsonwebtoken"

export const generateToken = (id, role, res) => {
    const token = jwt.sign({id, role}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("jwt", token, {
        maxAge: 7*1000*60*60*24,   
        httpOnly: true,     
        sameSite: "strict",     
        secure: process.env.NODE_ENV !== "development"  
    })

    return token
}