import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

type NotifPrefs = {
  emailPayments?: boolean;
  emailAlerts?: boolean;
  emailSystem?: boolean;
  inAppPayments?: boolean;
  inAppAlerts?: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    opts?: { skipEmail?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, email: true, notificationPreferences: true },
    });

    const prefs: NotifPrefs = (user?.notificationPreferences as NotifPrefs) ?? {};

    // Gate in-app notification based on prefs
    const isPaymentType = type === NotificationType.PAYMENT || type === NotificationType.SUCCESS;
    const isAlertType   = type === NotificationType.ALERT || type === NotificationType.WARNING;

    const suppressInApp =
      (isPaymentType && prefs.inAppPayments === false) ||
      (isAlertType   && prefs.inAppAlerts   === false);

    let notification = null;
    if (!suppressInApp) {
      notification = await this.prisma.notification.create({
        data: { userId, title, message, type },
      });
    }

    // Send email if preferences allow
    if (!opts?.skipEmail && user) {
      const shouldEmailPayment = isPaymentType && prefs.emailPayments !== false;
      const shouldEmailAlert   = isAlertType   && prefs.emailAlerts   !== false;
      const shouldEmailSystem  = !isPaymentType && !isAlertType && prefs.emailSystem !== false;

      if (shouldEmailPayment || shouldEmailAlert || shouldEmailSystem) {
        if (shouldEmailAlert) {
          this.mail.sendGatewayAlert(user.email, user.firstName, title, message).catch(() => {});
        } else {
          this.mail.sendPaymentNotification(user.email, user.firstName, { title, message }).catch(() => {});
        }
      }
    }

    return notification;
  }

  async findAllForUser(userId: string) {
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

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }
}
