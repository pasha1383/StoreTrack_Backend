import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import * as nodemailer from 'nodemailer';
import {sendEmailDto} from "./dto/email.dto";

@Injectable()
export class MailService {
    constructor(private configService: ConfigService) {}

    emailTransport() {
        return nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASSWORD'),
            },
        });
    }

    async sendLowStockAlert(adminEmail: string, lowStockProducts: any[]) {
        const productListHtml = lowStockProducts.map(product => `
      <li>
        <strong>${product.name}</strong> - Current Stock: ${product.stock}
      </li>
    `).join('');

        await this.sendEmail({
            recipients: [adminEmail],
            subject: 'Low Stock Alert for StoreTrack',
            html: `
        <p>Dear Admin,</p>
        <p>The following products have a low stock count:</p>
        <ul>
          ${productListHtml}
        </ul>
        <p>Please restock these items as soon as possible.</p>
        <p>Best regards,<br/>StoreTrack System</p>
      `,
        });
    }

    async sendEmail(dto: sendEmailDto) {
        const { recipients, subject, html } = dto;

        const transport = this.emailTransport();

        const options: nodemailer.SendMailOptions = {

            to: recipients,
            subject: subject,
            html: html,
        };
        try {
            await transport.sendMail(options);
            console.log('Email sent successfully');
        } catch (error) {
            console.log('Error sending mail: ', error);
        }
    }
}
