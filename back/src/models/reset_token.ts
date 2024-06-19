import mongoose from 'mongoose'

const Schema = mongoose.Schema;

let ResetToken = new Schema({
    token: {
        type: String
    },
    email: {
        type: String
    },
    expire_time: {
        type: Date
    }
})

export default mongoose.model('ResetToken', ResetToken, 'tokens');