import mongoose from "mongoose";

const Schema = mongoose.Schema;
let User = new Schema({
    username: {
        type: String
    },
    name: {
        type: String
    }, 
    surname: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    telephone: {
        type: String
    }, 
    country: {
        type: String
    },
    city: {
        type: String
    },
    rate: {
        type: Number
    },
    visitedCities: {
        type: Array
    },
    visitedCountries: {
        type: Array
    },
    points: {
        type: Number
    },
    age: {
        type: Number
    },
    type: {
        type: String
    },
    languages: {
        type: Array
    },
    currentCity: {
        type: String
    }

})
export default mongoose.model('User', User, 'users')