"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let User = new Schema({
    username: {
        type: String
    },
    name: {
        type: String
    }, surname: {
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
    }, country: {
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
});
exports.default = mongoose_1.default.model('User', User, 'users');
