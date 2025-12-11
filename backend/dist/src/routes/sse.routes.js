"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SseController_1 = require("../controllers/SseController");
const router = (0, express_1.Router)();
// Route unique pour connexion SSE
router.get('/connect', SseController_1.connectSse);
exports.default = router;
//# sourceMappingURL=sse.routes.js.map