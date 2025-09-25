"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error("❌ Global Error Handler:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Erreur serveur",
    });
}
//# sourceMappingURL=errorHandler.js.map