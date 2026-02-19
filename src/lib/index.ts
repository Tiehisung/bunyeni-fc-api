

export function getErrorMessage(
  error: unknown,
  customMessage?: string
): string {
  if (!error) return "Unknown error occurred";

  const err = error as Record<string, unknown>;

  // 1. Fetch-based API errors
  if (error instanceof Response) {
    return `Request failed: ${error.status} ${error.statusText}`;
  }

  // 2. Server returned structured JSON { error, message }
  if (err.error && typeof err.error === "string") return err.error;

  if (err.message && typeof err.message === "string") return err.message;

  // 3. Axios errors
  if (err.response && typeof err.response === "object") {
    const response = err.response as Record<string, unknown>;
    if (response.data && typeof response.data === "object") {
      const data = response.data as Record<string, unknown>;
      if (data.message && typeof data.message === "string") return data.message;
      if (data.error && typeof data.error === "string") return data.error;
    }
  }

  // 4. Zod/Joi/Mongoose validation errors
  if (err.details && Array.isArray(err.details) && err.details.length) {
    return err.details.map((d: { message: string }) => d.message).join(", ");
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors && typeof err.errors === "object") {
    return Object.values(err.errors)
      .map((e: { message: string }) => e.message)
      .join(", ");
  }

  // 5. Network errors
  if (err.name === "NetworkError") {
    return "Network error — please check your connection.";
  }

  // 6. String errors
  if (typeof error === "string") return error;

  // 7. Default fallback
  return customMessage ?? "Something went wrong. Please try again.";
}

export const createFileUrl = (file: File) => URL.createObjectURL(file);

export const getFilePath = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function getFileName(url: string) {
  try {
    return url.split("/").pop()?.split("?")[0] ?? "file";
  } catch {
    return "file";
  }
}

export const deleteEmptyKeys = (obj: AnyObject): AnyObject => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "undefined" || obj[key] === null || obj[key] === "")
      delete obj[key];
  });
  return obj;
};

//
export type AnyObject = { [key: string]: unknown };
export function removeEmptyKeys(obj: AnyObject): AnyObject {
  return Object.keys(obj).reduce((acc: AnyObject, key: string) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export function roundToNearest(num: number, nearest?: 10 | 100 | 1000) {
  if (nearest == 10) return Math.round(num / 10) * 10;
  if (nearest == 100) return Math.round(num / 100) * 100;
  if (nearest == 1000) return Math.round(num / 1000) * 1000;
  return Math.round(num / 10) * 10;
}

export const shortText = (text: string, maxLength = 30) =>
  text?.length >= maxLength ? `${text.substring(0, maxLength)}...` : text;

export const getInitials = (text: string | string[], length = 2) => {
  if (!text) return "";
  const list = typeof text == "string" ? text.trim().split(" ") : text;
  const initials = list?.map((l) => l.trim()[0]);
  return initials.join("").substring(0, Math.min(length, initials.length));
};

export const getAge = (dob: string | Date) => {
  const birthDate = new Date(dob);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const getRandomIndex = (length: number) =>
  Math.ceil(Math.random() * length - 1);



export const generateNumbers = (from: number, to: number) => {
  const acc = [];
  for (let i = from; i <= to; i++) {
    acc.push(i);
  }
  return acc;
};

export const bytesToMB = (bytes: number): number => {
  return Number((bytes / (1024 * 1024)).toFixed(2));
};

export function buildQueryStringServer(
  searchParams: Record<string, string | string[] | boolean | undefined>
) {
  if (!searchParams) return "";

  const query = new URLSearchParams(
    Object.entries(searchParams).filter(([_, v]) => v !== undefined) as [
      string,
      string
    ][]
  ).toString();

  return query ? `?${query}` : "";
}

export const getUrlToShare = () => typeof window !== 'undefined' ? window.location.href : "";

export function slugify(text: string, appendTimestamp: boolean = false): string {
  // Create slug
  const base = text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")       // replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, "");          // trim leading/trailing dashes

  // Timestamp: YYYY-MM-DD-HHMMSS
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${`${yyyy}`.substring(-2)}-${mm}-${dd}-${hh}${min}${ss}`;

  return appendTimestamp ? `${base.substring(0, 200)}-${timestamp}` : base.substring(0, 200);
}


// export const formatName = (fName: string, lName: string) => `${fName} ${lName}`