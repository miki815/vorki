import mongoose from "mongoose";

const Schema = mongoose.Schema;
let Job = new Schema({
    id: {
        type: Number
    },
    idUser: {
        type: Number
    }, 
    title: {
        type: String
    },
    description: {
        type: String
    },
    city: {
        type: String
    },
    profession: {
        type: String
    }, 

})
export default mongoose.model('Job', Job, 'job')