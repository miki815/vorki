"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
});
exports.default = mongoose_1.default.model('ResetToken', ResetToken, 'tokens');
