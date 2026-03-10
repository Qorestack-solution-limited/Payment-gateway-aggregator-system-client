import React from "react";
import { Navbar } from "../Components/landing/Navbar";
import { Hero } from "../Components/landing/Hero";
import { TrustedBy } from "../Components/landing/TrustedBy";
import { HowItWorks } from "../Components/landing/HowItWorks";
import { Features } from "../Components/landing/Features";
import { GatewayIntegrations } from "../Components/landing/GatewayIntegrations";
import { Stats } from "../Components/landing/Stats";
import { Pricing } from "../Components/landing/Pricing";
import { CTABanner } from "../Components/landing/CTABanner";
import { Footer } from "../Components/landing/Footer";
export function LandingPage() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <Hero />
      <TrustedBy />
      <HowItWorks />
      <Features />
      <GatewayIntegrations />
      <Stats />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}
