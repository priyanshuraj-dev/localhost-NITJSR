import mongoose, { Schema, Document } from "mongoose";

export interface History extends Document {
  email: string;
  nameDoc: string;
  uploadUrl: string;
  inputText: string;       // raw text if user pasted text instead of file
  language: string;        // output language requested
  details: string;         // full AI JSON response (stringified)
  createdAt: Date;
}

const HistorySchema: Schema<History> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      // NOT unique — one user has many history entries
      match: [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid email"],
      index: true,
    },
    nameDoc: { type: String, default: "Pasted Text" },
    uploadUrl: { type: String, default: "" },
    inputText: { type: String, default: "" },
    language: { type: String, default: "English" },
    details: { type: String, required: true }, // JSON string of AI response
  },
  { timestamps: true }
);

const HistoryModel =
  (mongoose.models.History as mongoose.Model<History>) ||
  mongoose.model<History>("History", HistorySchema);

export default HistoryModel;
