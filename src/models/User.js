// const {Schema, model} = require('mongoose');
// const bcrypt = require('bcryptjs');
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const userSchema = new Schema({
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "default"
    }
}, {
    timestamps: true
});

// userSchema.methods.encryptPassword = async pwd => await bcrypt.hash(pwd, 12);
userSchema.methods.checkPassword = async pwd => await bcrypt.compare(pwd, this.password);

module.exports = model('User', userSchema);