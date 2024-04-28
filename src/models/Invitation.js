import { Schema, model, Types } from "mongoose";

// Workaround bug. An empty String causes validation error when the field is required
Schema.Types.String.checkRequired(v => v != null);

const invitationSchema = new Schema(
    {
        collectionId: {
            type: Types.ObjectId,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        userId: {
            type: Types.ObjectId,
            required: false,
        },
        UUID: {
            type: Types.UUID,
            required: true,
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

invitationSchema.index({ collectionId: 1, email: 1 }, { unique: true });

invitationSchema.methods.setExpiration = function (seconds) {
    this.expireAt = Date.now() + seconds * 1000;
};

const Invitation = model("Invitation", invitationSchema);

export { Invitation };
