import { Schema, model, Types } from "mongoose";

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const blacklogSchema = new Schema(
    {
        context: {
            type: String,
            required: true
        },
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
            enum: ["access", "refresh"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Blacklog = model("Blacklog", blacklogSchema);

export { Blacklog };
