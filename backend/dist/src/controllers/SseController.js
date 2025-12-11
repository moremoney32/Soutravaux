"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSse = connectSse;
const SseServices_1 = require("../services/SseServices");
async function connectSse(req, res) {
    const userId = req.query.userId;
    if (!userId) {
        res.status(400).json({
            success: false,
            message: 'userId est requis'
        });
        return;
    }
    console.log(`🔌 SSE: Connexion demandée par user ${userId}`);
    (0, SseServices_1.addSseConnection)(userId, res);
}
//# sourceMappingURL=SseController.js.map