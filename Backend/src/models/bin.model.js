import mongoose, {Schema} from "mongoose";

const binSchema = new mongoose.Schema({
    binId: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    allottedWorker: {
        type: Schema.Types.ObjectId,
        ref: "Worker"
    }
}, {timestamps: true})

const Bin = mongoose.model("Bin", binSchema)
export default Bin