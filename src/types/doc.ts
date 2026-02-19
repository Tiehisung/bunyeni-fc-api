import { IFileProps } from "./file.interface";

export interface IDocFile extends IFileProps {
    format: "pdf" | "image";
    folder: string;
}
export interface IFolder {
    _id: string;
    name: string
    description?: string
    documents?: IDocFile[]
    isDefault?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface IFolderMetrics extends Omit<IFolder, 'documents'> {
    docsCount: number;
    documents: string[]
}

// suggested folders
enum DocumentFolder {
    OTHERS = "others",
    // Player
    PLAYER_SIGNING_FORM = "player-signing-form",
    PLAYER_CONSENT_FORM = "player-consent-form",
    PLAYER_MEDICAL_RECORD = "player-medical-record",
    PLAYER_PROGRESS_REPORT = "player-progress-report",
    PLAYER_PERFORMANCE_STAT = "player-performance-stat",
    PLAYER_ID_COPY = "player-id-copy",
    PLAYER_PASSPORT = "player-passport",
    PLAYER_ACADEMIC_RECORD = "player-academic-record",

    // Team & Club
    CLUB_POLICY = "club-policy",
    CLUB_CONSTITUTION = "club-constitution",
    CLUB_PRESS_RELEASE = "club-press-release",

    // Match
    MATCH_REPORT = "match-report",
    MATCH_HIGHLIGHT = "match-highlight",
    MATCH_INJURY_REPORT = "match-injury-report",
    MATCH_PLAYER_RATING = "match-player-rating",

    // Admin
    ADMIN_MEETING_MINUTE = "admin-meeting-minute",
    ADMIN_EQUIPMENT_RECEIPT = "admin-equipment-receipt",
    ADMIN_OFFICIAL_LETTER = "admin-official-letter",

    // Media
    CLUB_LOGO = "club-logo",
    CLUB_BANNER_IMAGE = "club-banner-image",
    TEAM_PHOTO = "team-photo",
    SOCIAL_MEDIA_ASSET = "social-media-asset",

    // Medical
    INJURY_REPORT = "injury-report",
    MEDICAL_CLEARANCE = "medical-clearance",
    FITNESS_TEST = "fitness-test",
    PHYSIO_REPORT = "physio-report",

    // Guardian / Parent
    PARENT_ID_COPY = "parent-id-copy",
    PARENT_LETTER = "parent-letter",

    // Misc
    DONATION_RECEIPT = "donation-receipt",
    CLUB_SUPPORT_ITEM = "club-support-item",
    EQUIPMENT_INVENTORY = "equipment-inventory",
    EVENT_PERMISSION = "event-permission",
    TOURNAMENT_REGISTRATION = "tournament-registration",
}
