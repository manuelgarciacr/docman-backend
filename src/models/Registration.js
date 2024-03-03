import { Schema, model, Types } from "mongoose";
// import {randomUUID} from 'crypto';
// import { NIL, parse} from "uuid";

const EXPIRATION = parseInt(process.env.EXPIRATION ?? "10");

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

//const emptyUuid = new Types.UUID(NIL);

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
            default: () => new Date(Date.now() + 1000 * 60 * EXPIRATION),
        },
    },
    {
        timestamps: true,
    }
);
registrationSchema.index({ user: 1, collection: 1 }, { unique: true });

const Registration = model("Registration", registrationSchema);

export { Registration };
