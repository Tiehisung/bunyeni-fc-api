// controllers/goal.controller.ts
import type { Request, Response } from "express";
import { getErrorMessage } from "../../../lib";
import { logAction } from "../../log/helper";
import PlayerModel from "../../players/player.model";
import MatchModel from "../match.model";
import GoalModel, { IPostGoal } from "./goals.model";
import { ELogSeverity } from "../../../types/log.interface";

// GET /api/goals
export const getGoals = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string || "1", 10);
    const limit = Number.parseInt(req.query.limit as string || "10", 10);
    const skip = (page - 1) * limit;

    const search = (req.query.goal_search as string) || "";
    const matchId = req.query.matchId as string;
    const playerId = req.query.playerId as string;
    const forKFC = req.query.forKFC === 'true';

    const regex = new RegExp(search, "i");

    const query: any = {};

    if (search) {
      query.$or = [
        { "scorer._id": regex },
        { "scorer.name": regex },
        { "assist.name": regex },
        { "assist._id": regex },
        { "description": regex },
        { "opponent.name": regex },
        { "opponent._id": regex },
        { "modeOfScore": regex },
      ];
    }

    if (matchId) {
      query.match = matchId;
    }

    if (playerId) {
      query.$or = [
        ...(query.$or || []),
        { "scorer._id": playerId },
        { "assist._id": playerId },
      ];
    }

    if (req.query.forKFC !== undefined) {
      query.forKFC = forKFC;
    }

    const goals = await GoalModel.find(query)
      .populate('match', 'title date competition')
      .populate('scorer', 'name number position')
      .populate('assist', 'name number position')
      .limit(limit)
      .skip(skip)
      .lean()
      .sort({ createdAt: "desc" });

    const total = await GoalModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: goals,
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
      message: getErrorMessage(error, "Failed to fetch goals"),
    });
  }
};

// GET /api/goals/:id
export const getGoalById = async (req: Request, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await GoalModel.findById(goalId)
      .populate('match', 'title date competition')
      .populate('scorer', 'name number position')
      .populate('assist', 'name number position')
      .lean();

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch goal"),
    });
  }
};

// GET /api/goals/match/:matchId
export const getGoalsByMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    const goals = await GoalModel.find({ match: matchId })
      .populate('scorer', 'name number position')
      .populate('assist', 'name number position')
      .sort({ minute: 'asc' })
      .lean();

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch match goals"),
    });
  }
};

// GET /api/goals/player/:playerId
export const getGoalsByPlayer = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;

    const goals = await GoalModel.find({
      $or: [
        { "scorer._id": playerId },
        { "assist._id": playerId }
      ]
    })
      .populate('match', 'title date competition')
      .populate('scorer', 'name number position')
      .populate('assist', 'name number position')
      .sort({ createdAt: 'desc' })
      .lean();

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch player goals"),
    });
  }
};

// POST /api/goals
export const createGoal = async (req: Request, res: Response) => {
  try {
    const { match, description, minute, scorer, assist, modeOfScore, forKFC } = req.body as IPostGoal;

    // Validate required fields
    if (!match || !minute) {
      return res.status(400).json({
        success: false,
        message: "Match ID and minute are required",
      });
    }

    // Create goal
    const savedGoal = await GoalModel.create({
      match,
      description,
      minute,
      scorer,
      assist,
      modeOfScore,
      forKFC,
      createdBy: req?.user?._id,
      createdAt: new Date(),
    });

    if (!savedGoal) {
      return res.status(500).json({
        message: "Failed to create goal.",
        success: false
      });
    }

    // Update Match - add goal reference
    const updatedMatch = await MatchModel.findByIdAndUpdate(
      match,
      { $push: { goals: savedGoal._id } },
      { new: true }
    );

    // Update Player statistics
    if (forKFC && scorer) {
      // Add goal to scorer
      await PlayerModel.findByIdAndUpdate(
        scorer?._id,
        { $push: { goals: savedGoal._id } }
      );

      // Add assist to assistant if exists
      if (assist) {
        await PlayerModel.findByIdAndUpdate(
          assist?._id,
          { $push: { assists: savedGoal._id } }
        );
      }
    }

    // Update live match events
    // if (minute) {
    //   const assistance = assist ? `Assist: ${assist?.number ?? ''} ${assist.name} ` : '';
    //   await updateLiveMatchEvents(match?.toString(), {
    //     type: 'goal',
    //     minute: String(minute),
    //     title: `⚽ ${minute}' - ${scorer?.number ?? ''} ${scorer?.name ?? 'Goal scored'}`,
    //     description: `${assistance} ${description || ''} Mode: ${modeOfScore || 'N/A'}`,
    //     timestamp: new Date(),
    //   });
    // }

    // Log action
    await logAction({
      title: `Goal Created - ${updatedMatch?.title || 'Match'}`,
      description: description || `Goal scored at ${minute}'`,
      meta: {
        goalId: savedGoal._id,
        matchId: match,
        scorer: scorer?.name,
        minute,
      },
    });

    // Populate for response
    const populatedGoal = await GoalModel.findById(savedGoal._id)
      .populate('scorer', 'name number position')
      .populate('assist', 'name number position')
      .lean();

    res.status(201).json({
      message: "Goal created successfully!",
      success: true,
      data: populatedGoal
    });

  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create goal"),
      success: false,
    });
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;

    // Remove _id from updates
    delete updates._id;

    const updatedGoal = await GoalModel.findByIdAndUpdate(
      goalId,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req?.user?._id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: updatedGoal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to update goal"),
    });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { goalId } = req.params;

    // Find the goal first to get details
    const goalToDelete = await GoalModel.findById(goalId).lean();

    if (!goalToDelete) {
      return res.status(404).json({
        message: "Goal not found",
        success: false
      });
    }

    const { forKFC, match, scorer, assist } = goalToDelete;

    // Delete the goal
    const deletedGoal = await GoalModel.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      return res.status(500).json({
        message: "Failed to delete goal.",
        success: false
      });
    }

    // Update Match - remove goal reference
    const updatedMatch = await MatchModel.findByIdAndUpdate(
      match,
      { $pull: { goals: goalId } },
      { new: true }
    );

    // Update Player statistics
    if (forKFC && scorer) {
      // Remove goal from scorer
      await PlayerModel.findByIdAndUpdate(
        scorer?._id,
        { $pull: { goals: goalId } }
      );

      // Remove assist from assistant if exists
      if (assist) {
        await PlayerModel.findByIdAndUpdate(
          assist?._id,
          { $pull: { assists: goalId } }
        );
      }
    }

    // Log action
    await logAction({
      title: `Goal Deleted - ${updatedMatch?.title || 'Match'}`,
      description: deletedGoal?.description || 'Goal deleted',
      severity: ELogSeverity.CRITICAL,
      meta: {
        goalId: goalId,
        matchId: match,
        scorer: scorer?.name,
      },
    });

    res.status(200).json({
      message: "Goal deleted successfully!",
      success: true,
      data: deletedGoal
    });

  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete goal"),
      success: false,
    });
  }
};

// DELETE /api/goals/bulk (bulk delete)
export const bulkDeleteGoals = async (req: Request, res: Response) => {
  try {
    const { goalIds } = req.body;

    if (!goalIds || !Array.isArray(goalIds) || goalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No goal IDs provided",
      });
    }

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const goalId of goalIds) {
      try {
        const goal = await GoalModel.findById(goalId);

        if (goal) {
          // Update match
          await MatchModel.findByIdAndUpdate(
            goal.match,
            { $pull: { goals: goalId } }
          );

          // Update player stats if KFC goal
          if (goal.forKFC && goal.scorer) {
            await PlayerModel.findByIdAndUpdate(
              goal.scorer._id,
              { $pull: { goals: goalId } }
            );

            if (goal.assist) {
              await PlayerModel.findByIdAndUpdate(
                goal.assist._id,
                { $pull: { assists: goalId } }
              );
            }
          }

          // Delete the goal
          await GoalModel.findByIdAndDelete(goalId);
          results.successful.push(goalId);
        }
      } catch (error) {
        results.failed.push({
          id: goalId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${results.successful.length} goals, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to bulk delete goals"),
    });
  }
};

// GET /api/goals/stats
export const getGoalStats = async (req: Request, res: Response) => {
  try {
    const stats = await GoalModel.aggregate([
      {
        $facet: {
          totalGoals: [{ $count: "count" }],
          byMode: [
            {
              $group: {
                _id: "$modeOfScore",
                count: { $sum: 1 },
              },
            },
          ],
          byMinute: [
            {
              $bucket: {
                groupBy: "$minute",
                boundaries: [0, 15, 30, 45, 60, 75, 90, 120],
                default: "Other",
                output: {
                  count: { $sum: 1 },
                },
              },
            },
          ],
          topScorers: [
            {
              $match: { forKFC: true }
            },
            {
              $group: {
                _id: "$scorer._id",
                name: { $first: "$scorer.name" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: 10
            }
          ],
          topAssists: [
            {
              $match: {
                forKFC: true,
                assist: { $exists: true, $ne: null }
              }
            },
            {
              $group: {
                _id: "$assist._id",
                name: { $first: "$assist.name" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: 10
            }
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalGoals: stats[0]?.totalGoals[0]?.count || 0,
        byMode: stats[0]?.byMode || [],
        byMinute: stats[0]?.byMinute || [],
        topScorers: stats[0]?.topScorers || [],
        topAssists: stats[0]?.topAssists || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch goal statistics"),
    });
  }
};