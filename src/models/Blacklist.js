import { Schema, model, Types } from "mongoose";
import { getHash } from "../tokens.js"

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const blacklistSchema = new Schema(
    {
        hash: {
            type: String,
            required: true,
            default: function () {
                
                return getHash(this._id)
            },
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

blacklistSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000;
};

blacklistSchema.methods.setExpirationTime = function (time) {
    this.expireAt = time;
};

const Blacklist = model("Blacklist", blacklistSchema);

export { Blacklist };
