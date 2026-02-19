import { EPreset, EPresetType } from ".";
import { ISession } from "./user";

export interface ICldFileUploadResult {
    secure_url: string;
    url: string;
    thumbnail_url?: string;
    public_id: string;
    resource_type: "image" | "video" | "raw" | string;
    format?: string;
    bytes?: number;
    type: string;
    name?: string;
    original_filename?: string;
    tags?: string[];
    width: number;
    height: number;
    id: string;
    batchId: string;
    asset_id: string;
    version: number;
    version_id: string;
    signature: string;
    created_at?: string;
    etag: string;
    placeholder: boolean;
    folder?: string;
    access_mode: string;
    existing: boolean;
    path?: string;
}

export interface IFileProps extends ICldFileUploadResult {
    _id?: string; //Trace any saved file data on db
    name?: string;
    description?: string; //Optional field to save with file on db
    createdAt?: string;
    updatedAt?: string;
}

export interface IFileUpload {
    name: string;
    path: string;
    type?: string;
    preset?: EPreset;
    folder?: string; //eg. logos, images, videos, audios/qiraa
    presetType?: EPresetType;
    description?: string;
}

export interface IGallery {
    _id?: string;
    title?: string;
    description: string;
    files: Array<IFileProps>;
    timestamp?: number;

    type?: 'player' | 'donation' | 'general',
    tags?: string[];
    createdBy?: ISession['user']
    createdAt?: string;
    updatedAt?: string;
}