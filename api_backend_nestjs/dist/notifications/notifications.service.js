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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let NotificationsService = class NotificationsService {
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async create(userId, title, message, type = client_1.NotificationType.INFO, opts) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, email: true, notificationPreferences: true },
        });
        const prefs = user?.notificationPreferences ?? {};
        const isPaymentType = type === client_1.NotificationType.PAYMENT || type === client_1.NotificationType.SUCCESS;
        const isAlertType = type === client_1.NotificationType.ALERT || type === client_1.NotificationType.WARNING;
        const suppressInApp = (isPaymentType && prefs.inAppPayments === false) ||
            (isAlertType && prefs.inAppAlerts === false);
        let notification = null;
        if (!suppressInApp) {
            notification = await this.prisma.notification.create({
                data: { userId, title, message, type },
            });
        }
        if (!opts?.skipEmail && user) {
            const shouldEmailPayment = isPaymentType && prefs.emailPayments !== false;
            const shouldEmailAlert = isAlertType && prefs.emailAlerts !== false;
            const shouldEmailSystem = !isPaymentType && !isAlertType && prefs.emailSystem !== false;
            if (shouldEmailPayment || shouldEmailAlert || shouldEmailSystem) {
                if (shouldEmailAlert) {
                    this.mail.sendGatewayAlert(user.email, user.firstName, title, message).catch(() => { });
                }
                else {
                    this.mail.sendPaymentNotification(user.email, user.firstName, { title, message }).catch(() => { });
                }
            }
        }
        return notification;
    }
    async findAllForUser(userId) {
        const [notifications, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { notifications, unreadCount };
    }
    async markRead(id, userId) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
    async markAllRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async remove(id, userId) {
        return this.prisma.notification.deleteMany({ where: { id, userId } });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map