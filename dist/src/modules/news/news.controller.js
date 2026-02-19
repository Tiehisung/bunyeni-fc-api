"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsStats = exports.deleteNews = exports.shareNews = exports.likeNews = exports.togglePublishStatus = exports.updateNews = exports.createNews = exports.getNewsBySlug = exports.getNewsByCategory = exports.getLatestNews = exports.getTrendingNews = exports.getNews = void 0;
const lib_1 = require("../../lib");
const slug_1 = require("../../lib/slug");
const timeAndDate_1 = require("../../lib/timeAndDate");
const archive_interface_1 = require("../../types/archive.interface");
const log_interface_1 = require("../../types/log.interface");
const archive_model_1 = __importDefault(require("../archives/archive.model"));
const helper_1 = require("../logs/helper");
const news_model_1 = __importDefault(require("./news.model"));
// GET /api/news
const getNews = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const search = req.query.news_search || "";
        const isTrending = req.query.isTrending === "true";
        const isLatest = req.query.isLatest === "true";
        const isPublished = req.query.isPublished === "true";
        const isUnpublished = req.query.isPublished === "false";
        const hasVideo = req.query.hasVideo === "true";
        const category = req.query.category;
        const author = req.query.author;
        const from = req.query.from;
        const to = req.query.to;
        const regex = new RegExp(search, "i");
        const query = {};
        // Filters
        if (isTrending) {
            query["stats.isTrending"] = true;
        }
        if (isLatest) {
            query["stats.isLatest"] = true;
        }
        if (hasVideo) {
            query["stats.hasVideo"] = true;
        }
        if (isPublished) {
            query.isPublished = true;
        }
        if (isUnpublished) {
            query.isPublished = false;
        }
        if (category) {
            query.category = category;
        }
        if (author) {
            query["reporter.id"] = author;
        }
        // Date range filter
        if (from || to) {
            query.createdAt = {};
            if (from)
                query.createdAt.$gte = new Date(from);
            if (to)
                query.createdAt.$lte = new Date(to);
        }
        // Search
        if (search) {
            query.$or = [
                { "headline.text": regex },
                { "headline.subtitle": regex },
                { "details.summary": regex },
                { "details.content": regex },
                { "category": regex },
                { "tags": regex },
            ];
        }
        const cleaned = (0, lib_1.removeEmptyKeys)(query);
        const news = await news_model_1.default.find(cleaned)
            .populate('reporter.id', 'name email avatar')
            .populate('featuredImage')
            .populate('gallery')
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await news_model_1.default.countDocuments(cleaned);
        res.status(200).json({
            success: true,
            data: news,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch news"),
        });
    }
};
exports.getNews = getNews;
// GET /api/news/trending
const getTrendingNews = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "5", 10);
        const news = await news_model_1.default.find({ "stats.isTrending": true, isPublished: true })
            .populate('reporter.id', 'name avatar')
            .populate('featuredImage')
            .sort({ "stats.viewCount": -1, createdAt: -1 })
            .limit(limit)
            .lean();
        res.status(200).json({
            success: true,
            data: news,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch trending news"),
        });
    }
};
exports.getTrendingNews = getTrendingNews;
// GET /api/news/latest
const getLatestNews = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const news = await news_model_1.default.find({ isPublished: true })
            .populate('reporter.id', 'name avatar')
            .populate('featuredImage')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.status(200).json({
            success: true,
            data: news,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch latest news"),
        });
    }
};
exports.getLatestNews = getLatestNews;
// GET /api/news/category/:category
const getNewsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const news = await news_model_1.default.find({ category, isPublished: true })
            .populate('reporter.id', 'name avatar')
            .populate('featuredImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await news_model_1.default.countDocuments({ category, isPublished: true });
        res.status(200).json({
            success: true,
            data: news,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch news by category"),
        });
    }
};
exports.getNewsByCategory = getNewsByCategory;
// GET /api/news/:slug
const getNewsBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const news = await news_model_1.default.findOne(filter)
            .populate('reporter.id', 'name email avatar bio')
            .populate('featuredImage')
            .populate('gallery')
            .lean();
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        // Increment view count
        await news_model_1.default.findByIdAndUpdate(news._id, {
            $inc: { "stats.viewCount": 1 }
        });
        res.status(200).json({
            success: true,
            data: news,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch news"),
        });
    }
};
exports.getNewsBySlug = getNewsBySlug;
// POST /api/news
const createNews = async (req, res) => {
    try {
        const { headline, details, reporter, } = req.body;
        // Generate slug from headline
        const slug = (0, lib_1.slugify)(headline.text);
        // Check if slug already exists
        const existingNews = await news_model_1.default.findOne({ slug });
        if (existingNews) {
            return res.status(409).json({
                success: false,
                message: "News with similar headline already exists",
            });
        }
        const published = await news_model_1.default.create({
            slug,
            headline,
            details,
            reporter: {
                name: reporter?.name || req.user?.name,
                avatar: reporter?.avatar || req.user?.image,
            },
            isPublished: true,
            publishedAt: new Date(),
            stats: {
                viewCount: 0,
                likeCount: 0,
                shareCount: 0,
                isTrending: false,
                isLatest: true,
                hasVideo: !!headline?.hasVideo,
            },
            createdBy: req.user?.id,
            createdAt: new Date(),
        });
        if (!published) {
            return res.status(500).json({
                success: false,
                message: "Failed to publish news",
            });
        }
        // Log action
        await (0, helper_1.logAction)({
            title: "📰 News Created",
            description: headline.text,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                newsId: published._id,
                slug: published.slug,
                category: published.category,
            },
        });
        // Populate for response
        const populatedNews = await news_model_1.default.findById(published._id)
            .populate('reporter.id', 'name email avatar')
            .populate('featuredImage')
            .populate('gallery')
            .lean();
        res.status(201).json({
            success: true,
            message: "News published successfully",
            data: populatedNews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to publish news"),
        });
    }
};
exports.createNews = createNews;
// PUT /api/news/:slug
const updateNews = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const body = req.body;
        // If headline changed, update slug
        if (body.headline?.text) {
            body.slug = (0, lib_1.slugify)(body.headline.text);
            // Check if new slug already exists (excluding current)
            const existingNews = await news_model_1.default.findOne({
                slug: body.slug,
                _id: { $ne: (await news_model_1.default.findOne(filter))?._id }
            });
            if (existingNews) {
                return res.status(409).json({
                    success: false,
                    message: "News with similar headline already exists",
                });
            }
        }
        // Update news
        const updated = await news_model_1.default.findOneAndUpdate(filter, {
            $set: {
                ...body,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true })
            .populate('reporter.id', 'name email avatar')
            .populate('featuredImage')
            .populate('gallery')
            .lean();
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        // Log update
        await (0, helper_1.logAction)({
            title: "📰 News Updated",
            description: updated.headline.text,
            severity: log_interface_1.ELogSeverity.INFO,
            meta: {
                newsId: updated._id,
                slug: updated.slug,
                updates: Object.keys(body),
            },
        });
        res.status(200).json({
            success: true,
            message: "News updated successfully",
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update news"),
        });
    }
};
exports.updateNews = updateNews;
// PATCH /api/news/:slug/publish
const togglePublishStatus = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const { isPublished } = req.body;
        const updated = await news_model_1.default.findOneAndUpdate(filter, {
            $set: {
                isPublished,
                publishedAt: isPublished ? new Date() : null,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        res.status(200).json({
            success: true,
            message: `News ${isPublished ? 'published' : 'unpublished'} successfully`,
            data: updated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to update publish status"),
        });
    }
};
exports.togglePublishStatus = togglePublishStatus;
// POST /api/news/:slug/like
const likeNews = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const updated = await news_model_1.default.findOneAndUpdate(filter, {
            $inc: { "stats.likeCount": 1 },
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        res.status(200).json({
            success: true,
            data: { likeCount: updated.stats?.likeCount },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to like news"),
        });
    }
};
exports.likeNews = likeNews;
// POST /api/news/:slug/share
const shareNews = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        const updated = await news_model_1.default.findOneAndUpdate(filter, {
            $inc: { "stats.shareCount": 1 },
        }, { new: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        res.status(200).json({
            success: true,
            data: { shareCount: updated.stats?.shareCount },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to share news"),
        });
    }
};
exports.shareNews = shareNews;
// DELETE /api/news/:slug
const deleteNews = async (req, res) => {
    try {
        const slug = req.params.slug;
        const filter = (0, slug_1.slugIdFilters)(slug);
        // Find news item first
        const foundNewsItem = await news_model_1.default.findOne(filter);
        if (!foundNewsItem) {
            return res.status(404).json({
                success: false,
                message: "News not found",
            });
        }
        // Archive the news item
        await archive_model_1.default.create({
            sourceCollection: archive_interface_1.EArchivesCollection.NEWS,
            originalId: foundNewsItem._id,
            data: { ...foundNewsItem.toObject(), isLatest: false },
            archivedAt: new Date(),
            archivedBy: req.user?.id,
            reason: 'News deleted',
        });
        // Delete from main collection
        const deleted = await news_model_1.default.findOneAndDelete(filter);
        // Log deletion
        await (0, helper_1.logAction)({
            title: "📰 News Deleted",
            description: `News item "${foundNewsItem.headline?.text}" deleted on ${(0, timeAndDate_1.formatDate)(new Date().toISOString())}`,
            severity: log_interface_1.ELogSeverity.CRITICAL,
            meta: {
                newsId: foundNewsItem._id,
                slug: foundNewsItem.slug,
                category: foundNewsItem.category,
            },
        });
        res.status(200).json({
            success: true,
            message: "News deleted successfully",
            data: {
                id: deleted?._id,
                headline: foundNewsItem.headline?.text,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete news"),
        });
    }
};
exports.deleteNews = deleteNews;
// GET /api/news/stats
const getNewsStats = async (req, res) => {
    try {
        const stats = await news_model_1.default.aggregate([
            {
                $facet: {
                    totalNews: [{ $count: "count" }],
                    byCategory: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                    ],
                    byType: [
                        {
                            $group: {
                                _id: "$type",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byMonth: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" },
                                },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { "_id.year": -1, "_id.month": -1 } },
                        { $limit: 12 },
                    ],
                    totalViews: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$stats.viewCount" },
                            },
                        },
                    ],
                    totalLikes: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$stats.likeCount" },
                            },
                        },
                    ],
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalNews: stats[0]?.totalNews[0]?.count || 0,
                byCategory: stats[0]?.byCategory || [],
                byType: stats[0]?.byType || [],
                byMonth: stats[0]?.byMonth || [],
                totalViews: stats[0]?.totalViews[0]?.total || 0,
                totalLikes: stats[0]?.totalLikes[0]?.total || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch news statistics"),
        });
    }
};
exports.getNewsStats = getNewsStats;
