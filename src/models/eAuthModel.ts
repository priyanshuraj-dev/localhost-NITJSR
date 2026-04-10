import mongoose, { Schema, Document } from "mongoose";

export interface Eauth extends Document {
  email: string;
  token: string;
  validity: Date;
}

const EauthSchema: Schema<Eauth> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
        "Please enter a valid email address",
      ],
    },
    token: {
      type: String,
      required: [true, "Error generating the auth token , please retry "],
    },
    validity: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const EauthModel =
  (mongoose.models.Eauth as mongoose.Model<Eauth>) ||
  mongoose.model<Eauth>("Eauth", EauthSchema);

export default EauthModel;
