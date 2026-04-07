import mongoose, {Schema} from 'mongoose'

const imageSchema = new mongoose.Schema({
    imageURL: {
        type: String,
        required: true
    },
    binId: {
        type: Schema.Types.ObjectId,
        ref: "Bin"
    }
}, {timestamps: true})

const Image = mongoose.model("Image", imageSchema)
export default Image