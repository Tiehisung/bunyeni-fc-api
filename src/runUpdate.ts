import { Request, Response, } from "express";

// Public routes
export async function runUpdate(req: Request, res: Response) {
    try {
        let update
        // update = await GoalModel.updateMany({}, {
        //     $set: {
        //         teamId: ENV.TEAM.ID,
        //     },
        //     $unset: {
        //         forKFC: '',
        //     }
        // })
        res.json({ update, })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: (error.message || "Failed to update")
        });
    }
}


 