import mongoose, {Schema} from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    rollno: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    branch: {
        type: String, 
        required: true
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema)
export default User