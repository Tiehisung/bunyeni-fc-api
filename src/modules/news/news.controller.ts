// controllers/news.controller.ts
import type { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import { removeEmptyKeys, getErrorMessage, slugify } from "../../lib";
import { slugIdFilters } from "../../lib/slug";
import { formatDate } from "../../lib/timeAndDate";
import { TSearchKey } from "../../types";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { IPostNews } from "../../types/news.interface";
import ArchiveModel from "../archives/archive.model";
import { logAction } from "../logs/helper";
import NewsModel from "./news.model";

// GET /api/news
export const getNews = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.news_search as TSearchKey) || "";
    const isTrending = req.query.isTrending === "true";
    const isLatest = req.query.isLatest === "true";
    const isPublished = req.query.isPublished === "true";
    const isUnpublished = req.query.isPublished === "false";
    const hasVideo = req.query.hasVideo === "true";
    const category = req.query.category as string;
    const author = req.query.author as string;
    const from = req.query.from as string;
    const to = req.query.to as string;

    const regex = new RegExp(search, "i");

    const query: any = {};

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
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
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

    const cleaned = removeEmptyKeys(query);

    const news = await NewsModel.find(cleaned)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await NewsModel.countDocuments(cleaned);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch news"),
    });
  }
};

// GET /api/news/trending
export const getTrendingNews = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "5", 10);

    const news = await NewsModel.find({ "stats.isTrending": true, isPublished: true })
      .sort({ "stats.viewCount": -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch trending news"),
    });
  }
};

// GET /api/news/latest
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "10", 10);

    const news = await NewsModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch latest news"),
    });
  }
};

// GET /api/news/category/:category
export const getNewsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const news = await NewsModel.find({ category, isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await NewsModel.countDocuments({ category, isPublished: true });

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch news by category"),
    });
  }
};

// GET /api/news/:slug
export const getNewsBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    const news = await NewsModel.findOne(filter)
      .lean();

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Increment view count
    await NewsModel.findByIdAndUpdate(news._id, {
      $inc: { "stats.viewCount": 1 }
    });

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch news"),
    });
  }
};

// POST /api/news
export const createNews = async (req: Request, res: Response) => {
  try {
    const { headline, details, reporter, } = req.body as IPostNews;

    // Generate slug from headline
    const slug = slugify(headline.text as string);

    // Check if slug already exists
    const existingNews = await NewsModel.findOne({ slug });
    if (existingNews) {
      return res.status(409).json({
        success: false,
        message: "News with similar headline already exists",
      });
    }

    const published = await NewsModel.create({
      slug,
      headline,
      details,
      reporter: {

        // name: reporter?.name || req.user?.name,
        // avatar: reporter?.avatar || req.user?.image,
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
      // createdBy: req.user?.id,
      createdAt: new Date(),
    });

    if (!published) {
      return res.status(500).json({
        success: false,
        message: "Failed to publish news",
      });
    }

    // Log action
    await logAction({
      title: "📰 News Created",
      description: headline.text as string,
      severity: ELogSeverity.INFO,

      meta: {
        newsId: published._id,
        slug: published.slug,
        category: published.category,
      },
    });

    // Populate for response
    const populatedNews = await NewsModel.findById(published._id)

      .lean();

    res.status(201).json({
      success: true,
      message: "News published successfully",
      data: populatedNews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to publish news"),
    });
  }
};

// PUT /api/news/:slug
export const updateNews = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);
    const body = req.body;

    // If headline changed, update slug
    if (body.headline?.text) {
      body.slug = slugify(body.headline.text);

      // Check if new slug already exists (excluding current)
      const existingNews = await NewsModel.findOne({
        slug: body.slug,
        _id: { $ne: (await NewsModel.findOne(filter))?._id }
      });

      if (existingNews) {
        return res.status(409).json({
          success: false,
          message: "News with similar headline already exists",
        });
      }
    }

    // Update news
    const updated = await NewsModel.findOneAndUpdate(
      filter,
      {
        $set: {
          ...body,
          updatedAt: new Date(),
          // updatedBy: req.user?.id,
        },
      },
      { new: true, runValidators: true }
    )
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Log update
    await logAction({
      title: "📰 News Updated",
      description: updated.headline.text,
      severity: ELogSeverity.INFO,

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update news"),
    });
  }
};

// PATCH /api/news/:slug/publish
export const togglePublishStatus = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);
    const { isPublished } = req.body;

    const updated = await NewsModel.findOneAndUpdate(
      filter,
      {
        $set: {
          isPublished,
          publishedAt: isPublished ? new Date() : null,
          updatedAt: new Date(),
          // updatedBy: req.user?.id,
        },
      },
      { new: true }
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update publish status"),
    });
  }
};

// POST /api/news/:slug/like
export const likeNews = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    const updated = await NewsModel.findOneAndUpdate(
      filter,
      {
        $inc: { "stats.likeCount": 1 },
      },
      { new: true }
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to like news"),
    });
  }
};

// POST /api/news/:slug/share
export const shareNews = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    const updated = await NewsModel.findOneAndUpdate(
      filter,
      {
        $inc: { "stats.shareCount": 1 },
      },
      { new: true }
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to share news"),
    });
  }
};

// DELETE /api/news/:slug
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    // Find news item first
    const foundNewsItem = await NewsModel.findOne(filter);

    if (!foundNewsItem) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Archive the news item
    await ArchiveModel.create({
      sourceCollection: EArchivesCollection.NEWS,
      originalId: foundNewsItem._id,
      data: { ...foundNewsItem.toObject(), isLatest: false },
      archivedAt: new Date(),
      // archivedBy: req.user?.id,
      reason: 'News deleted',
    });

    // Delete from main collection
    const deleted = await NewsModel.findOneAndDelete(filter);

    // Log deletion
    await logAction({
      title: "📰 News Deleted",
      description: `News item "${foundNewsItem.headline?.text}" deleted on ${formatDate(new Date().toISOString())}`,
      severity: ELogSeverity.CRITICAL,

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to delete news"),
    });
  }
};

// GET /api/news/stats
export const getNewsStats = async (req: Request, res: Response) => {
  try {
    const stats = await NewsModel.aggregate([
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch news statistics"),
    });
  }
};