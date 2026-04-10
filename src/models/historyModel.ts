import mongoose, { Schema, Document } from "mongoose";
export interface History extends Document{
    email: string;
    nameDoc: string;
    uploadUrl: string;
    details: string;
    guideUrl: string;
}

const HistorySchema: Schema<History> = new Schema(
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
        nameDoc:{
            type: String,
            default: "none",
        },
        uploadUrl:{
            type: String,
            default: "none",
        },
        details:{
            type: String
        },
        guideUrl:{
            type: String
        }
    }
)

const HistoryModel = (mongoose.models.History as mongoose.Model<History>) || mongoose.model<History>("History",HistorySchema);
export default HistoryModel;