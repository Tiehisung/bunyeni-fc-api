// controllers/news.controller.ts
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { removeEmptyKeys, slugify } from "../../lib";
import { slugIdFilters } from "../../lib/slug";
import { formatDate } from "../../lib/timeAndDate";
import { TSearchKey } from "../../types";
import { EArchivesCollection } from "../../types/archive.interface";
import { ELogSeverity } from "../../types/log.interface";
import { IPostNews } from "../../types/news.interface";
import ArchiveModel from "../archives/archive.model";
import { logAction } from "../log/helper";
import { updateFanPoints } from "../users/fan.controller";
import "../users/user.model";
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
      .populate("comments.user", "name image")
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to fetch news"),
    });
  }
};

// GET /api/news/trending
export const getTrendingNews = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "5", 10);

    const news = await NewsModel.find({ "stats.isTrending": true, isPublished: true })
      .populate("comments.user", "name image")
      .sort({ "stats.viewCount": -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to fetch trending news"),
    });
  }
};

// GET /api/news/latest
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string || "10", 10);

    const news = await NewsModel.find({ isPublished: true })
      .populate("comments.user", "name image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to fetch latest news"),
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
      .sort({ createdAt: -1 }).populate("comments.user", "name image")
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to fetch news by category"),
    });
  }
};

// GET /api/news/:slug
export const getNewsBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const filter = slugIdFilters(slug);

    const news = await NewsModel.findOne(filter)
    .populate("comments.user", "name image")
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to fetch news"),
    });
  }
};

// POST /api/news
export const createNews = async (req: Request, res: Response) => {
  try {
    const { headline, details, } = req.body as IPostNews;

    console.log('body', req.body)

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to publish news"),
    });
  }
};

// PUT /api/news/:slug
export const updateNews = async (req: Request, res: Response) => {
  try {
    const newsId = req.params.newsId as string;

    const body = req.body;


    // If headline changed, update slug
    if (body.headline?.text) {
      body.slug = slugify(body.headline.text);

      // Check if new slug already exists (excluding current)
      const existingNews = await NewsModel.findById(newsId);

      if (existingNews) {
        return res.status(409).json({
          success: false,
          message: "News with similar headline already exists",
        });
      }
    }

    // Update news
    const updated = await NewsModel.findByIdAndUpdate(
      newsId,
      {
        $set: {
          ...body,
        },
      },

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to update news"),
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to update publish status"),
    });
  }
};




// DELETE /api/news/:slug
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const newsId = req.params.newsId as string;


    // Find news item first
    const foundNewsItem = await NewsModel.findById(newsId);

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
    const deleted = await NewsModel.findByIdAndDelete(newsId);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: (error.message || "Failed to delete news"),
    });
  }
};

// GET /api/news/stats
export const getNewsStats = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;

    const news = await NewsModel.findById(newsId)
      .select("views comments shares likes")
      .populate("comments.user", "name image")
      .populate("likes.user", "name image")
      .populate("views.user", "name image")
      .populate("shares.user", "name image");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        views: news.views?.length || 0,
        comments: news.comments?.map((c: { _id: any; comment: any; date: any; user: any; name: any; }) => ({
          _id: c._id,
          comment: c.comment,
          date: c.date,
          user: c.user,
          name: c.name
        })) || [],
        shares: news.shares?.length || 0,
        likes: news.likes?.length || 0,
        userLiked: false // Will be determined client-side
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to get stats")
    });
  }
};



// Update news views
export const updateNewsViews = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { deviceId, userId, } = req.body;

    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    // Check if this device/user already viewed
    const alreadyViewed = news.views?.some(
      (view: { device: string; user: string; }) => view.device === deviceId && view.user === userId
    );

    if (!alreadyViewed) {
      const newView = {
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        date: new Date().toISOString(),
        device: deviceId,
      };

      news.views = [...(news.views || []), newView];
      await news.save();

      // Award points to fan if user is logged in
      if (userId) {
        await updateFanPoints(userId, "newsView");
      }

      return res.status(200).json({
        success: true,
        message: "View recorded",
        data: { views: news.views.length }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Already viewed",
      data: { views: news.views.length }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to update views")
    });
  }
};

// Update news likes (NEW)
export const updateNewsLikes = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { userId, name, deviceId, isLike } = req.body;

    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    // Check if this user/device already liked
    const existingLikeIndex = news.likes?.findIndex(
      (like: { device: string; user: string }) => like.device === deviceId && (userId && like.user === userId)
    );

    if (isLike) {
      // Add like if not already liked
      if (existingLikeIndex === -1) {
        const newLike = {
          user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          name: name,
          date: new Date().toISOString(),
          device: deviceId,
        };

        news.likes = [...(news.likes || []), newLike];
        await news.save();

        // Award points to fan
        if (userId) {
          await updateFanPoints(userId, "reaction");
        }

        return res.status(200).json({
          success: true,
          message: "Liked successfully",
          data: {
            liked: true,
            likes: news.likes.length
          }
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Already liked",
          data: {
            liked: true,
            likes: news.likes.length
          }
        });
      }
    } else {
      // Remove like
      if (existingLikeIndex !== -1 && existingLikeIndex !== undefined) {
        news.likes.splice(existingLikeIndex, 1);
        await news.save();
      }

      return res.status(200).json({
        success: true,
        message: "Unliked successfully",
        data: {
          liked: false,
          likes: news.likes.length
        }
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to update like")
    });
  }
};


// Update news comments
export const updateNewsComments = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { comment, userId, } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty"
      });
    }

    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    const newComment = {
      user: userId,
      date: new Date().toISOString(),
      comment: comment.trim(),
    };

      await NewsModel.findByIdAndUpdate(newsId, { $set: { comments: [newComment, ...(news.comments || [])] } })

    // Award points to fan
    if (userId) {
      await updateFanPoints(userId, "comment");
    }

    // Populate user data before returning
    const populatedNews = await NewsModel.findById(newsId)
      .populate("comments.user", "name image")
      .lean();

    const addedComment = populatedNews?.comments?.[0];

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: addedComment,
        totalComments: news.comments.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to add comment")
    });
  }
};

// Delete comment
export const deleteNewsComment = async (req: Request, res: Response) => {
  try {
    const { newsId, } = req.params;
    const { userId, isAdmin, commentId } = req.body;

    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    const comment = news.comments.find((c: { _id: string; }) => c._id == commentId)

    // Allow deletion if user is admin or comment owner
    if (!isAdmin && comment.user?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    const commentIndex = news.comments.findIndex((c: { _id: string; }) => c._id == commentId)

    news.comments.splice(commentIndex, 1);
    await news.save();



    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: { totalComments: news.comments.length }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to delete comment")
    });
  }
};

// Update news shares
export const updateNewsShares = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { userId, deviceId } = req.body;

    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }


    const newShare = {
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      date: new Date().toISOString(),
      device: deviceId,
    };

    news.shares = [...(news.shares || []), newShare];
    await news.save();

    // Award points to fan
    if (userId) {
      await updateFanPoints(userId, "share");
    }

    return res.status(200).json({
      success: true,
      message: "Share recorded",
      data: { shares: news.shares.length }
    });



  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: (error.message || "Failed to record share")
    });
  }
};


