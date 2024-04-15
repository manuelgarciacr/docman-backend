import { Schema, model, Types } from "mongoose";

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const documentSchema = new Schema(
    {
        collectionId: {
            type: Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        folder: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

documentSchema.index({ name: 1, folder: 1 }, { unique: true });

const Document = model("Document", documentSchema);

export { Document };

