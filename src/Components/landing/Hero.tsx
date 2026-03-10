import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon, ZapIcon } from "lucide-react";
function CreditCard() {
  return (
    <div
      className="relative w-full mx-auto card-container-mobile"
      style={{
        height: "280px",
        maxWidth: "360px",
      }}>
      {/* Background card */}
      <div
        className="card-float-secondary absolute"
        style={{
          width: "260px",
          height: "160px",
          top: "60px",
          right: "0px",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #0a3020 0%, #1a5c35 50%, #0d3a20 100%)",
          border: "1px solid rgba(200, 240, 74, 0.15)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          transform: "rotate(6deg)",
          zIndex: 1,
        }}>
        <div className="p-5 h-full flex flex-col justify-between opacity-70">
          <div className="flex justify-between items-start">
            <div
              className="w-8 h-6 rounded"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            />
          </div>
          <div>
            <div className="text-white/40 text-xs mb-1">
              •••• •••• •••• 1289
            </div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div
        className="card-float absolute"
        style={{
          width: "280px",
          height: "172px",
          top: "20px",
          left: "0px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, #1a5c35 0%, #0d3a20 40%, #1a4a2e 70%, #0a2a15 100%)",
          border: "1px solid rgba(200, 240, 74, 0.25)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
          zIndex: 2,
        }}>
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div
              style={{
                width: "32px",
                height: "24px",
                borderRadius: "5px",
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            />

            <span
              className="font-black italic"
              style={{
                fontSize: "20px",
                color: "white",
                letterSpacing: "-0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}>
              VISA
            </span>
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1 font-mono tracking-widest">
              5375 3742 4411 4355
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                Card Holder
              </div>
              <div className="text-white text-sm font-semibold">Sarah Chen</div>
              <div className="text-white/50 text-xs mt-0.5">09/27</div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                Balance
              </div>
              <div
                className="font-bold"
                style={{
                  fontSize: "20px",
                  color: "#C8F04A",
                  textShadow: "0 0 20px rgba(200,240,74,0.4)",
                }}>
                ₦5,750.20
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          delay: 1,
          duration: 0.4,
        }}
        className="absolute z-10"
        style={{
          bottom: "10px",
          right: "10px",
        }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: "rgba(200, 240, 74, 0.15)",
            border: "1px solid rgba(200, 240, 74, 0.3)",
            color: "#C8F04A",
            backdropFilter: "blur(8px)",
          }}>
          <ZapIcon className="w-3 h-3" />
          Payment Processed
        </div>
      </motion.div>
    </div>
  );
}
export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
      {/* Background radial glow */}
      <div className="hero-radial absolute inset-0 pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 text-black bg-green-950"
        // style={{
        //   backgroundImage: `linear-gradient(rgba(200,240,74,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.3) 1px, transparent 1px)`,
        //   backgroundSize: "60px 60px",
        // }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="inline-flex items-center gap-2 mb-6">
              <span
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                style={{
                  background: "rgba(200, 240, 74, 0.12)",
                  border: "1px solid rgba(200, 240, 74, 0.3)",
                  color: "#C8F04A",
                }}>
                🏆 The World's Favorite Payment Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-none mb-6">
              <span className="text-black block">Simplify</span>
              <span className="text-black block">Payments.</span>
              <span className="block mt-1">
                <span className="text-black">Empower </span>
                <span
                  style={{
                    color: "#C8F04A",
                  }}>
                  Business.
                </span>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
              style={{
                color: "rgba(23, 22, 22, 0.65)",
              }}>
              PayOrch lets you manage multiple payment gateways from one unified
              dashboard — reduce complexity, maximize revenue, and scale without
              limits.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="lime-btn flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold shadow-lg w-full sm:w-auto justify-center">
                Get Started
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <div
                className="flex items-center gap-2"
                style={{
                  color: "rgba(255,255,255,0.5)",
                }}>
                <CheckCircleIcon
                  className="w-4 h-4"
                  style={{
                    color: "#C8F04A",
                  }}
                />

                <span className="text-sm">No credit card required</span>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.6,
                delay: 0.5,
              }}
              className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {["#C8F04A", "#34d399", "#60a5fa", "#f472b6"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{
                        borderColor: "#0B2518",
                        background: color,
                        color: "#0B2518",
                      }}>
                      {["A", "B", "C", "D"][i]}
                    </div>
                  ),
                )}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                }}>
                <span className="text-sm">
                  Trusted by <strong className="text-white">10,000+</strong>{" "}
                  businesses
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right: Card visual — hidden on very small screens, shown sm+ */}
          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="hidden sm:flex justify-center lg:justify-end">
            <CreditCard />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #f8faf8)",
        }}
      />
    </section>
  );
}
