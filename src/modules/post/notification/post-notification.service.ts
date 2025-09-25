import { Injectable } from '@nestjs/common';

@Injectable()
export class PostNotificationService {
  async notifyNewPost(post: { id: string; type: string; title: string }, recipients: Array<{ email?: string; phone?: string }>) {
    // Placeholder: integrate with email/SMS/in-app. Here we just simulate.
    // You can implement Nodemailer/Twilio here using env settings.
    return { notified: recipients.length, type: post.type };
  }
}

