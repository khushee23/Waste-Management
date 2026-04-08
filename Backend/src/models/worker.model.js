import mongoose, {Schema} from "mongoose";

const workerSchema = new mongoose.Schema({
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
    workerId: {
        type: Number,
        required: true
    },
    binsAllotted: [{
        type: Schema.Types.ObjectId,
        ref: "Bin"
    }],
    tasksPending: [{
        type: Schema.Types.ObjectId, 
        ref: "Image"
    }],
    lat:[{
        type: Number,
        required: true
    },
    lng:{
        type: Number,
        required: true  
    }],
        
}, {timestamps: true})

const Worker = mongoose.model("Worker", workerSchema)
export default Worker