import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import busboy, { FileInfo } from "busboy";
import { Readable } from "stream";
import mongoose from "mongoose";
import { connectDB } from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


// Mongoose schema — stores one record per uploaded document
const DocumentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },       // from JWT (Google sub)
    userEmail: { type: String, required: true },    // from JWT

    fileName: { type: String, required: true },     // original file name
    fileType: {
      type: String,
      enum: ["pdf", "image", "txt", "docx"],
      required: true,
    },

    cloudinaryUrl: { type: String, required: true }, // secure_url from Cloudinary
    cloudinaryPublicId: { type: String, required: true },
    folder: { type: String, required: true },        // e.g. "govt_docs/pdfs"

    // Optional metadata the client can send alongside the file
    title: { type: String, default: "" },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["uploaded", "processing", "done", "error"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

// Avoid model re-registration during Next.js hot-reload
const GovDocument =
  mongoose.models.GovDocument ||
  mongoose.model("GovDocument", DocumentSchema);

// Helpers


/** Map a MIME type → { fileType, cloudinaryFolder } */
function resolveFileType(mimetype: string): {
  fileType: "pdf" | "image" | "txt" | "docx";
  folder: string;
} | null {
  if (mimetype === "application/pdf")
    return { fileType: "pdf", folder: "govt_docs/pdfs" };

  if (["image/jpeg", "image/png", "image/webp"].includes(mimetype))
    return { fileType: "image", folder: "govt_docs/images" };

  if (mimetype === "text/plain")
    return { fileType: "txt", folder: "govt_docs/txts" };

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return { fileType: "docx", folder: "govt_docs/docx" };

  return null; // unsupported
}

/** Cloudinary resource type needed per file category */
function cloudinaryResourceType(
  fileType: "pdf" | "image" | "txt" | "docx"
): "image" | "raw" {
  return fileType === "image" ? "image" : "raw";
}

// POST /api/cloudinary/upload
export async function POST(req: NextRequest) {
  // 1. Auth — cookie-based (logtok)
  const token = req.cookies.get("logtok")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorised: not logged in" }, { status: 401 });
  }

  let jwtPayload: { email: string };
  try {
    jwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
  } catch {
    return NextResponse.json({ error: "Unauthorised: invalid or expired session" }, { status: 401 });
  }

  // ── 2. Content-Type guard 
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 415 }
    );
  }

  if (!req.body) {
    return NextResponse.json(
      { error: "Request body is empty" },
      { status: 400 }
    );
  }



  // ── 3. File size guard (20 MB) ───────────────────────────────────────────
const contentLength = req.headers.get("content-length");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per file

if (contentLength && parseInt(contentLength) > MAX_SIZE) {
  return NextResponse.json(
    { error: "File too large. Maximum allowed size is 10 MB." },
    { status: 413 }
  );
}
  // 3. Parse multipart form with Busboy 
const bb = busboy({
  headers: { "content-type": contentType },
  limits: {
    fileSize: MAX_SIZE, // busboy will emit 'filesizeexceeded' if breached
  },
});
  const nodeStream = Readable.fromWeb(req.body as any);

  // Text fields sent alongside the file (title, description, etc.)
  const fields: Record<string, string> = {};

  // Accumulate results from all file uploads
  interface UploadResult {
    fieldname: string;
    fileName: string;
    fileType: "pdf" | "image" | "txt" | "docx";
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    folder: string;
  }
  const uploadResults: UploadResult[] = [];
  const uploadErrors: { fieldname: string; error: string }[] = [];
  const uploadPromises: Promise<void>[] = [];

  bb.on(
    "file",
    (
      fieldname: string,
      fileStream: NodeJS.ReadableStream,
      info: FileInfo
    ) => {
      const { filename, mimeType } = info;
      const resolved = resolveFileType(mimeType);

      if (!resolved) {
        // Drain the stream so Busboy doesn't hang, then record the error
        fileStream.resume();
        uploadErrors.push({
          fieldname,
          error: `Unsupported file type: ${mimeType}. Allowed: PDF, JPG/PNG, TXT, DOCX.`,
        });
        return;
      }

      const { fileType, folder } = resolved;

      const promise = new Promise<void>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: cloudinaryResourceType(fileType),
            // Store original filename as a Cloudinary context tag
            context: { original_filename: filename },
          },
          (error, result?: UploadApiResponse) => {
            if (error || !result) {
              uploadErrors.push({
                fieldname,
                error: error?.message || "Cloudinary upload failed",
              });
              return reject(error);
            }

            uploadResults.push({
              fieldname,
              fileName: filename,
              fileType,
              cloudinaryUrl: result.secure_url,
              cloudinaryPublicId: result.public_id,
              folder,
            });

            resolve();
          }
        );

        fileStream.pipe(uploadStream);

        fileStream.on("limit", () => {
  uploadErrors.push({
    fieldname,
    error: "File exceeds the 20 MB size limit.",
  });
  fileStream.resume(); // drain the stream so busboy doesn't hang
});
      });

      uploadPromises.push(promise);
    }
  );

  bb.on("field", (fieldname: string, value: string) => {
    fields[fieldname] = value;
  });

  const finished = new Promise<void>((resolve, reject) => {
    bb.on("close", resolve);
    bb.on("error", reject);
  });

  nodeStream.pipe(bb);

  await finished;

  // Wait for all Cloudinary uploads (ignore individual rejections — errors
  // are already captured in uploadErrors)
  await Promise.allSettled(uploadPromises);

  //  4. Persist every successful upload to MongoDB 
  const savedDocs = [];

  if (uploadResults.length > 0) {
    await connectDB();

    for (const result of uploadResults) {
      const doc = await GovDocument.create({
        userId: jwtPayload.email,
        userEmail: jwtPayload.email,
        fileName: result.fileName,
        fileType: result.fileType,
        cloudinaryUrl: result.cloudinaryUrl,
        cloudinaryPublicId: result.cloudinaryPublicId,
        folder: result.folder,
        title: fields["title"] || result.fileName,
        description: fields["description"] || "",
        status: "uploaded",
      });

      savedDocs.push({
        id: doc._id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        cloudinaryUrl: doc.cloudinaryUrl,
        status: doc.status,
        createdAt: doc.createdAt,
      });
    }
  }

  //  5. Response 
  const hasErrors = uploadErrors.length > 0;
  const hasSuccess = savedDocs.length > 0;

  if (!hasSuccess && hasErrors) {
    // Every file failed
    return NextResponse.json(
      { success: false, errors: uploadErrors },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      uploaded: savedDocs,       // saved to DB — these are ready for AI processing
      ...(hasErrors && { partialErrors: uploadErrors }), // some files may have failed
    },
    { status: 200 }
  );
}