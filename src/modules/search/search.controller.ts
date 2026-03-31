// controllers/search.controller.ts
import { Request, Response } from "express";
import { getErrorMessage } from "../../lib";
import MatchModel from "../matches/match.model";
import DocModel from "../media/documents/doc.model";
import GalleryModel from "../media/galleries/gallery.model";
import NewsModel from "../news/news.model";
import PlayerModel from "../players/player.model";
import SponsorModel from "../sponsors/sponsor.model";


interface SearchResult {
    type: string;
    id: string;
    title: string;
    description?: string;
    image?: string;
    url: string;
    date?: string;
    relevance: number;
    metadata?: any;
}

interface SearchOptions {
    q: string;
    types?: string[];
    limit?: number;
    page?: number;
    fromDate?: string;
    toDate?: string;
}

export class SearchController {

    // Main search endpoint
    static async globalSearch(req: Request, res: Response) {
        try {
            const basePath = req?.user?.role?.includes('admin') ? '/admin' : ''
            const {
                q,
                types = "players,matches,news,sponsors,galleries,docs",
                limit = 20,
                page = 1,
            } = req.query;

            const fromDate = getQueryString(req.query.fromDate);
            const toDate = getQueryString(req.query.toDate);

            if (!q || typeof q !== "string" || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Search query must be at least 2 characters"
                });
            }

            const searchTypes = (types as string).split(",");
            const skip = (Number(page) - 1) * Number(limit);
            const searchTerm = q.trim();
            const regex = new RegExp(searchTerm, "i");

            const results: SearchResult[] = [];
            const promises = [];

            // Search Players
            if (searchTypes.includes("players")) {
                promises.push(SearchController.searchPlayers(regex, fromDate as string, toDate, basePath));
            }

            // Search Matches
            if (searchTypes.includes("matches")) {
                promises.push(SearchController.searchMatches(regex, fromDate, toDate, basePath));
            }

            // Search News
            if (searchTypes.includes("news")) {
                promises.push(SearchController.searchNews(regex, fromDate, toDate, basePath));
            }

            // Search Sponsors
            if (searchTypes.includes("sponsors")) {
                promises.push(SearchController.searchSponsors(regex));
            }

            // Search Galleries
            if (searchTypes.includes("galleries")) {
                promises.push(SearchController.searchGalleries(regex));
            }

            // Search Documents by admins
            if (searchTypes.includes("docs") && req?.user?.role?.includes('admin')) {
                promises.push(SearchController.searchDocuments(regex));
            }

            const allResults = await Promise.all(promises);

            for (const resultArray of allResults) {
                results.push(...resultArray);
            }

            // Sort by relevance (higher score first)
            results.sort((a, b) => b.relevance - a.relevance);

            // Paginate results
            const paginatedResults = results.slice(skip, skip + Number(limit));
            const total = results.length;
            const totalPages = Math.ceil(total / Number(limit));

            return res.status(200).json({
                success: true,
                data: paginatedResults,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: totalPages
                },
                searchTerm: searchTerm
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error, "Search failed")
            });
        }
    }

    // Search Players
    private static async searchPlayers(regex: RegExp, fromDate?: string, toDate?: string, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const query: any = {
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { position: regex },
                    { number: regex },
                    { [`training.team`]: regex }
                ]
            };

            // Date filter if provided
            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) query.createdAt.$gte = new Date(fromDate);
                if (toDate) query.createdAt.$lte = new Date(toDate);
            }

            const players = await PlayerModel.find(query)
                .select("firstName lastName avatar position number training team status")
                .limit(50)
                .lean();

            return players.map(player => {
                let relevance = 0;

                // Calculate relevance score
                const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
                if (fullName.includes(regex.source.toLowerCase())) relevance += 10;
                if (player.position?.toLowerCase().includes(regex.source.toLowerCase())) relevance += 5;
                if (player.number?.toString().includes(regex.source)) relevance += 3;

                return {
                    type: "player",
                    id: player._id.toString(),
                    title: `${player.firstName} ${player.lastName}`,
                    description: `${player.position} | #${player.number} | Team ${player.training?.team || "N/A"}`,
                    image: player.avatar,
                    url: basePath ? `${basePath}/players/${player._id}` : `/players/details?playerId=${player._id}`,
                    date: player.createdAt,
                    relevance,
                    metadata: {
                        position: player.position,
                        number: player.number,
                        team: player.training?.team,
                        status: player.status
                    }
                };
            });
        } catch (error) {
            console.error("Error searching players:", error);
            return [];
        }
    }

    // Search Matches
    private static async searchMatches(regex: RegExp, fromDate?: string, toDate?: string, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const query: any = {
                $or: [
                    { title: regex },
                    { "opponent.name": regex },
                    { venue: regex },
                    { status: regex }
                ]
            };

            if (fromDate || toDate) {
                query.date = {};
                if (fromDate) query.date.$gte = new Date(fromDate);
                if (toDate) query.date.$lte = new Date(toDate);
            }

            const matches = await MatchModel.find(query)
                .select("title opponent date time status venue isHome")
                .populate('opponent')
                .limit(50)
                .lean({ virtuals: true });

            return matches.map(match => {
                let relevance = 0;
                if (match.title.toLowerCase().includes(regex.source.toLowerCase())) relevance += 10;
                if (match.opponent?.name?.toLowerCase().includes(regex.source.toLowerCase())) relevance += 8;

                return {
                    type: "match",
                    id: match._id.toString(),
                    title: match.title,
                    description: `${match.opponent?.name} | ${match.venue} | ${match.status}`,
                    image: match.opponent?.logo,
                    url: `${basePath ? basePath : ''}/matches/${match.slug || match._id}`,
                    date: match.date,
                    relevance,
                    metadata: {
                        opponent: match.opponent?.name,
                        venue: match.venue,
                        status: match.status,
                        isHome: match.isHome,
                        time: match.time
                    }
                };
            });
        } catch (error) {
            console.error("Error searching matches:", error);
            return [];
        }
    }

    // Search News
    private static async searchNews(regex: RegExp, fromDate?: string, toDate?: string, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const query: any = {
                isPublished: true,
                $or: [
                    { "headline.text": regex },
                    { "details.text": regex },
                    { tags: regex },
                    { "reporter.name": regex }
                ]
            };

            if (fromDate || toDate) {
                query.createdAt = {};
                if (fromDate) query.createdAt.$gte = new Date(fromDate);
                if (toDate) query.createdAt.$lte = new Date(toDate);
            }

            const news = await NewsModel.find(query)
                .select("headline details reporter tags createdAt slug")
                .limit(50)
                .lean();

            return news.map(article => {
                let relevance = 0;
                if (article.headline.text.toLowerCase().includes(regex.source.toLowerCase())) relevance += 10;
                if (article.tags?.some((tag: string) => tag.toLowerCase().includes(regex.source.toLowerCase()))) relevance += 5;

                return {
                    type: "news",
                    id: article._id.toString(),
                    title: article.headline.text,
                    description: article.details?.find((d: { text: string; }) => d.text)?.text?.substring(0, 200) || "",
                    image: article.headline.image,
                    url: `${basePath ? basePath : ''}/news/${article.slug || article._id}`,
                    date: article.createdAt,
                    relevance,
                    metadata: {
                        reporter: article.reporter?.name,
                        tags: article.tags
                    }
                };
            });
        } catch (error) {
            console.error("Error searching news:", error);
            return [];
        }
    }

    // Search Sponsors
    private static async searchSponsors(regex: RegExp, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const sponsors = await SponsorModel.find({
                $or: [
                    { name: regex },
                    { businessName: regex },
                    { businessDescription: regex }
                ]
            })
                .select("name businessName logo businessDescription")
                .limit(30)
                .lean();

            return sponsors.map(sponsor => ({
                type: "sponsor",
                id: sponsor._id.toString(),
                title: sponsor.businessName || sponsor.name,
                description: sponsor.businessDescription?.substring(0, 200) || "",
                image: sponsor.logo,
                url: `${basePath ? basePath : ''}/sponsorship/${sponsor._id}`,
                relevance: sponsor.name?.toLowerCase().includes(regex.source.toLowerCase()) ? 10 : 5,
                metadata: {
                    owner: sponsor.name,
                    businessName: sponsor.businessName
                }
            }));
        } catch (error) {
            console.error("Error searching sponsors:", error);
            return [];
        }
    }

    // Search Galleries
    private static async searchGalleries(regex: RegExp, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const galleries = await GalleryModel.find({
                $or: [
                    { title: regex },
                    { description: regex },
                    { tags: regex }
                ]
            })
                .select("title description files tags")
                .limit(30)
                .lean();

            return galleries.map(gallery => ({
                type: "gallery",
                id: gallery._id.toString(),
                title: gallery.title,
                description: gallery.description?.substring(0, 200) || "",
                image: gallery.files?.[0]?.secure_url,
                url: `${basePath ? basePath : ''}/gallery?gallery_search=${gallery.title}`,
                relevance: gallery.title?.toLowerCase().includes(regex.source.toLowerCase()) ? 10 : 5,
                metadata: {
                    tags: gallery.tags,
                    fileCount: gallery.files?.length || 0
                }
            }));
        } catch (error) {
            console.error("Error searching galleries:", error);
            return [];
        }
    }

    // Search Documents
    private static async searchDocuments(regex: RegExp, basePath: string = ''): Promise<SearchResult[]> {
        try {
            const documents = await DocModel.find({
                $or: [
                    { name: regex },
                    { original_filename: regex },
                    { description: regex },
                    { tags: regex }
                ]
            })
                .select("name original_filename description secure_url tags folder")
                .limit(30)
                .lean();

            return documents.map(doc => ({
                type: "document",
                id: doc._id.toString(),
                title: doc.name || doc.original_filename || "Untitled",
                description: doc.description?.substring(0, 200) || "",
                image: "/pdf-icon.png",
                url: `${basePath ? basePath : ''}/admin/docs/${doc._id}`,
                relevance: doc.name?.toLowerCase().includes(regex.source.toLowerCase()) ? 10 : 5,
                metadata: {
                    folder: doc.folder,
                    tags: doc.tags,
                    filename: doc.original_filename
                }
            }));
        } catch (error) {
            console.error("Error searching documents:", error);
            return [];
        }
    }

    // Quick Search (autocomplete)
    static async quickSearch(req: Request, res: Response) {
        const basePath = req?.user?.role?.includes('admin') ? '/admin' : ''
        try {
            const { q, limit = 5 } = req.query;

            if (!q || typeof q !== "string" || q.trim().length < 1) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }

            const searchTerm = q.trim();
            const regex = new RegExp(searchTerm, "i");

            const [players, matches, news] = await Promise.all([
                PlayerModel.find({ $or: [{ firstName: regex }, { lastName: regex }] })
                    .select("firstName lastName avatar position")
                    .limit(Number(limit))
                    .lean(),
                MatchModel.find({ $or: [{ title: regex }, { "opponent.name": regex }] })
                    .select("title opponent date status")
                    .limit(Number(limit))
                    .lean(),
                NewsModel.find({ "headline.text": regex, isPublished: true })
                    .select("headline slug")
                    .limit(Number(limit))
                    .lean()
            ]);

            const results = [
                ...players.map(p => ({
                    type: "player",
                    label: `${p.firstName} ${p.lastName}`,
                    value: p.code,
                    url: basePath ? `${basePath}/players/${p.code}` : `/players/details?playerId=${p._id}`,
                    image: p.avatar,
                    subtitle: p.position
                })),
                ...matches.map(m => ({
                    type: "match",
                    label: m.title,
                    value: m._id,
                    url: `${basePath ? basePath : ''}/matches/${m.slug || m._id}`,
                    subtitle: `${m.status} | ${new Date(m.date).toLocaleDateString()}`
                })),
                ...news.map(n => ({
                    type: "news",
                    label: n.headline.text.substring(0, 60),
                    value: n.slug || n._id,
                    url: `${basePath ? basePath : ''}/news/${n.slug || n._id}`,
                    subtitle: "News article"
                }))
            ];

            return res.status(200).json({
                success: true,
                data: results.slice(0, Number(limit))
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error, "Quick search failed")
            });
        }
    }
}
// Helper function to safely get string from query param
const getQueryString = (param: any): string | undefined => {
    if (!param) return undefined;
    if (typeof param === 'string') return param;
    if (Array.isArray(param)) return param[0];
    return undefined;
};

// Helper function to safely parse date
const safeParseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return undefined;
    }
    return parsed;
};
