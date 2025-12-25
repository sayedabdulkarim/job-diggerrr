import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  avatar?: string;
  techStack: string[];
  yearsOfExperience: number;
  locationPreference: 'remote' | 'onsite' | 'hybrid' | 'any';
  resumeUrl?: string;
  resumeParsedData?: {
    skills: string[];
    experience: string[];
    education: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String },
    techStack: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    locationPreference: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid', 'any'],
      default: 'any',
    },
    resumeUrl: { type: String },
    resumeParsedData: {
      skills: [{ type: String }],
      experience: [{ type: String }],
      education: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
