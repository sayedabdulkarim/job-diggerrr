import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  clicked: boolean;
  clickedAt?: Date;
  applied: boolean;
  appliedAt?: Date;
  savedForLater: boolean;
  coverLetterGenerated: boolean;
}

const InteractionSchema = new Schema<IInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    clicked: { type: Boolean, default: false },
    clickedAt: { type: Date },
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date },
    savedForLater: { type: Boolean, default: false },
    coverLetterGenerated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-job interaction
InteractionSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Interaction: Model<IInteraction> =
  mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', InteractionSchema);

export default Interaction;
