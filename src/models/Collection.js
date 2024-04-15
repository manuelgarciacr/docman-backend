import { Schema, model, Types } from "mongoose";

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
        stayLoggedIn: {
            type: Boolean,
            required: true,
            default: false
        },
        twoFactor: {
            type: Boolean,
            required: true,
            default: false
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
        users: [
            { type: Types.ObjectId, ref: "User", unique: true },
        ] /* owner is included */,
        roles: [{ type: String, enum: Object.keys(Role) }],
    },
    {
        timestamps: true,
    }
);

collectionSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000;
};

const Collection = model("Collection", collectionSchema);

export { Collection, Role };
