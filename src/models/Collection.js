import { Schema, model } from "mongoose";
import Document from './Document';

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

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
            default: "None"
        },
        owner: {
            type: ObjectId,
            ref: 'User'
        },
        users: [{type: ObjectId, ref: 'User'}], /* owner is included */
        documents: [Document]
    },
    {
        timestamps: true,
    }
);

module.exports = model("Collection", collectionSchema);
