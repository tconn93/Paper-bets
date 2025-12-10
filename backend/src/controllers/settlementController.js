import { SettlementService } from "../services/settlementService.js";

export class SettlementController {
    static async triggerSettlement(req, res, next) {
        try {
            const result = await SettlementService.processSettlements();

            res.status(200).json({
                success: true,
                message: "Settlement process completed",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
