import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
export function CTABanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px",
  });
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0B2518 0%, #1A4A2E 60%, #0d3020 100%)",
      }}
      ref={ref}>
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(200, 240, 74, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(200, 240, 74, 0.05) 0%, transparent 50%)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(200,240,74,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.6,
          }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{
              background: "rgba(200, 240, 74, 0.12)",
              border: "1px solid rgba(200, 240, 74, 0.25)",
              color: "#C8F04A",
            }}>
            <SparklesIcon className="w-4 h-4" />
            14-Day Free Trial — No Credit Card Required
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Ready to Unify
            <br />
            <span
              style={{
                color: "#C8F04A",
              }}>
              Your Payments?
            </span>
          </h2>

          <p
            className="text-xl mb-10 max-w-2xl mx-auto"
            style={{
              color: "rgba(255,255,255,0.6)",
            }}>
            Join 10,000+ businesses that trust PayOrch to manage their payment
            infrastructure. Get started in under 15 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="lime-btn flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold shadow-xl">
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold border-2 transition-all duration-200"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}>
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
