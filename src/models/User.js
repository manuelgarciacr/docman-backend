// const {Schema, model} = require('mongoose');
// const bcrypt = require('bcryptjs');
import { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const userSchema = new Schema(
    {
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        enabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        expireAt: {
            type: Date,
            expires: 0,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.hashPassword = function() {
    this.password = bcrypt.hashSync(this.password, 12)
};

userSchema.methods.checkPassword = function(pwd) {
    return bcrypt.compareSync(pwd, this.password);
};

userSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000;
};

const User = model('User', userSchema);

export { User };