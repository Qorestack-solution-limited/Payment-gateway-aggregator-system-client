"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const dashboard_service_1 = require("./dashboard.service");
const events_bus_service_1 = require("../events/events-bus.service");
let DashboardController = class DashboardController {
    constructor(dashboard, events) {
        this.dashboard = dashboard;
        this.events = events;
    }
    overview(orgId) {
        return this.dashboard.getOverview(orgId);
    }
    revenueChart(orgId) {
        return this.dashboard.getRevenueChart(orgId);
    }
    sseEvents(orgId, req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        const sub = this.events.stream(orgId).subscribe({
            next: (event) => {
                res.write(`data: ${JSON.stringify(event.data)}\n\n`);
            },
            error: () => res.end(),
        });
        const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
        req.on('close', () => {
            clearInterval(ping);
            sub.unsubscribe();
            res.end();
        });
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full dashboard overview (stats, gateway performance, recent txns)' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get 30-day revenue chart data' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "revenueChart", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "sseEvents", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        events_bus_service_1.EventsBusService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map