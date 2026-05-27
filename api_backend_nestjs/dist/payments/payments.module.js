"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const webhooks_module_1 = require("../webhooks/webhooks.module");
const gateway_credentials_service_1 = require("./gateway-credentials.service");
const flutterwave_adapter_1 = require("./providers/flutterwave.adapter");
const paystack_adapter_1 = require("./providers/paystack.adapter");
const paypal_adapter_1 = require("./providers/paypal.adapter");
const stripe_adapter_1 = require("./providers/stripe.adapter");
const payment_gateway_registry_1 = require("./payment-gateway.registry");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, webhooks_module_1.WebhooksModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [gateway_credentials_service_1.GatewayCredentialsService, paystack_adapter_1.PaystackAdapter, flutterwave_adapter_1.FlutterwaveAdapter, stripe_adapter_1.StripeAdapter, paypal_adapter_1.PayPalAdapter, payment_gateway_registry_1.PaymentGatewayRegistry, payments_service_1.PaymentsService],
        exports: [gateway_credentials_service_1.GatewayCredentialsService, paystack_adapter_1.PaystackAdapter, flutterwave_adapter_1.FlutterwaveAdapter, stripe_adapter_1.StripeAdapter, paypal_adapter_1.PayPalAdapter, payment_gateway_registry_1.PaymentGatewayRegistry, payments_service_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map