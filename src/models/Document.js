import { Schema, model } from "mongoose";

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const documentSchema = new Schema(
    {
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

module.exports = documentSchema;
