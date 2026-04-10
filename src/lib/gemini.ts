import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getGeminiModel = () =>
  genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export default genAI;