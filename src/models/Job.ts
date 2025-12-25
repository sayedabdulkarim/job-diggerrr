import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  description: string;
  techTags: string[];
  yoeRequired?: {
    min: number;
    max: number;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  source: 'remoteok' | 'arbeitnow' | 'himalayas' | 'jsearch' | 'adzuna' | 'jobicy';
  sourceUrl: string;
  sourceId: string;
  companyLogo?: string;
  postedAt: Date;
  fetchedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote'
    },
    description: { type: String, required: true },
    techTags: [{ type: String, index: true }],
    yoeRequired: {
      min: { type: Number },
      max: { type: Number },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String },
    },
    source: {
      type: String,
      enum: ['remoteok', 'arbeitnow', 'himalayas', 'jsearch', 'adzuna', 'jobicy'],
      required: true,
      index: true,
    },
    sourceUrl: { type: String, required: true },
    sourceId: { type: String, required: true },
    companyLogo: { type: String },
    postedAt: { type: Date, required: true, index: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index for deduplication
JobSchema.index({ source: 1, sourceId: 1 }, { unique: true });

// Text index for search
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
