import { Schema, model, Types } from "mongoose";

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
            expires: 0,
        },
    },
    {
        timestamps: true,
    }
);

tokenSchema.methods.increment = function () {
    ++this.pcounter
};

tokenSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000
}

const Token = model("Token", tokenSchema);

export { Token };
