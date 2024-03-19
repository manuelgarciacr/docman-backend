import { Schema, model, Types } from "mongoose";

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const registrationSchema = new Schema(
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
        stayLoggedIn: {
            type: Boolean,
            required: true
        },
        UUID: {
            type: Types.UUID,
            required: false,
        },
        code: {
            type: String,
            required: true,
            default: "",
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

registrationSchema.index({ user: 1, collection: 1 }, { unique: true });

registrationSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000;
};

const Registration = model("Registration", registrationSchema);

export { Registration };
