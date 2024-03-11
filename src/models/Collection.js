import { Schema, model, Types } from "mongoose";
import { documentSchema } from './index.js';

const EXPIRATION = parseInt(process.env.VALIDATION_EXPIRATION ?? "600");

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const Role = {
    admin: "admin",
    owner:  "owner",
    default: "default"
}

Object.freeze(Role);

const collectionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
            default: "",
        },
        enabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        expireAt: {
            type: Date,
            expires: 0,
            default: () => new Date(Date.now() + 1000 * EXPIRATION),
        },
        // owner: {
        //     type: Types.ObjectId,
        //     ref: 'User'
        // },
        users: [
            { type: Types.ObjectId, ref: "User", unique: true },
        ] /* owner is included */,
        roles: [{ type: String, enum: Object.keys(Role) }],
        documents: [documentSchema],
    },
    {
        timestamps: true,
    }
);

const Collection = model("Collection", collectionSchema);

export { Collection, Role };
