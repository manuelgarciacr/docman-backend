import { Schema, model, Types } from "mongoose";

const EXPIRATION = parseInt(process.env.REFRESH_EXPIRATION ?? (60 * 60 * 24).toString()); // Seconds. 1 day.

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const tokenSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        collectionId: {
            type: Types.ObjectId,
            ref: "Collection",
            required: true,
        },
        type: {
            type: String,
            enum: ['access', 'refresh'],
            required: true
        },
        counter: {
            type: Number,
            default: 1,
            required: true
        },
        expireAt: {
            type: Date,
            expires: EXPIRATION,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);

tokenSchema.methods.increment = function () {
    ++this.pcounter
};

const Token = model("Token", tokenSchema);

export { Token };
