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
exports.PaymentGatewayRegistry = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const flutterwave_adapter_1 = require("./providers/flutterwave.adapter");
const paystack_adapter_1 = require("./providers/paystack.adapter");
const paypal_adapter_1 = require("./providers/paypal.adapter");
const stripe_adapter_1 = require("./providers/stripe.adapter");
let PaymentGatewayRegistry = class PaymentGatewayRegistry {
    constructor(paystack, flutterwave, stripe, paypal) {
        this.paystack = paystack;
        this.flutterwave = flutterwave;
        this.stripe = stripe;
        this.paypal = paypal;
    }
    getAdapter(provider) {
        switch (provider) {
            case client_1.GatewayProvider.STRIPE:
                return this.stripe;
            case client_1.GatewayProvider.PAYPAL:
                return this.paypal;
            case client_1.GatewayProvider.PAYSTACK:
                return this.paystack;
            case client_1.GatewayProvider.FLUTTERWAVE:
                return this.flutterwave;
            default:
                throw new common_1.NotImplementedException(`${provider} integration is not implemented yet`);
        }
    }
    forGateway(gateway) {
        return this.getAdapter(gateway.provider);
    }
};
exports.PaymentGatewayRegistry = PaymentGatewayRegistry;
exports.PaymentGatewayRegistry = PaymentGatewayRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [paystack_adapter_1.PaystackAdapter,
        flutterwave_adapter_1.FlutterwaveAdapter,
        stripe_adapter_1.StripeAdapter,
        paypal_adapter_1.PayPalAdapter])
], PaymentGatewayRegistry);
//# sourceMappingURL=payment-gateway.registry.js.map