import mongoose, { Schema, Document } from "mongoose";

export interface History extends Document {
  email: string;
  nameDoc: string;
  uploadUrl: string;        // input file on Cloudinary (image/pdf/txt)
  outputUrl: string;        // output JSON on Cloudinary
  inputText: string;
  language: string;
  simplifiedOutput: string; // full SimplifiedOutput JSON string
  details?: string;
  createdAt: Date;
}

const HistorySchema: Schema<History> = new Schema(
  {
    email:            { type: String, required: true, index: true },
    nameDoc:          { type: String, default: "Document" },
    uploadUrl:        { type: String, default: "" },
    outputUrl:        { type: String, default: "" },
    inputText:        { type: String, default: "" },
    language:         { type: String, default: "en" },
    simplifiedOutput: { type: String, default: "" },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

const HistoryModel =
  (mongoose.models.History as mongoose.Model<History>) ||
  mongoose.model<History>("History", HistorySchema);

export default HistoryModel;
