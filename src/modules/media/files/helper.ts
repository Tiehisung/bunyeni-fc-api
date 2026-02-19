import { apiConfig } from "../../../lib/configs";
import { IQueryResponse } from "../../../types";

export async function deleteCldAssets(files: { public_id: string, resource_type?: string }[],) {
  try {
    //Delete file from cloudinary
    const response = await fetch(apiConfig.fileUpload, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(files),
    });
    const result: IQueryResponse = await response.json()
    return result
  } catch (error) {
    return { data: error, success: false, } as IQueryResponse
  }
}