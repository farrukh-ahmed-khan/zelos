import Busboy from "busboy";
import { NextRequest } from "next/server";

export interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<
    string,
    {
      filename: string;
      mimetype: string;
      encoding: string;
      buffer: Buffer;
    }
  >;
}

/**
 * Parse multipart form data from a NextRequest
 */
export async function parseFormData(request: NextRequest): Promise<ParsedFormData> {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("multipart/form-data")) {
    throw new Error("Content type must be multipart/form-data");
  }

  const fields: Record<string, string> = {};
  const files: Record<
    string,
    {
      filename: string;
      mimetype: string;
      encoding: string;
      buffer: Buffer;
    }
  > = {};

  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        "content-type": contentType,
      },
    });

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on("file", (fieldname, file, info) => {
      const chunks: Buffer[] = [];

      file.on("data", (data) => {
        chunks.push(data);
      });

      file.on("end", () => {
        files[fieldname] = {
          filename: info.filename,
          mimetype: info.mimeType,
          encoding: info.encoding,
          buffer: Buffer.concat(chunks),
        };
      });

      file.on("error", (error) => {
        reject(error);
      });
    });

    busboy.on("close", () => {
      resolve({ fields, files });
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    // Feed the request body to busboy
    const body = request.body;
    if (!body) {
      reject(new Error("Request body is empty"));
      return;
    }

    const reader = body.getReader();

    const pump = async () => {
      try {
        const { done, value } = await reader.read();
        if (done) {
          busboy.end();
          return;
        }
        busboy.write(Buffer.from(value));
        pump();
      } catch (error) {
        reject(error);
      }
    };

    pump();
  });
}
