import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlusIcon, LinkIcon, CreditCardIcon } from 'lucide-react';
export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  return (
    <section
      id="features"
      className="py-24"
      style={{
        background: '#F8FAF8'
      }}
      ref={ref}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={
          isInView ?
          {
            opacity: 1,
            y: 0
          } :
          {}
          }
          transition={{
            duration: 0.5
          }}
          className="text-center mb-16">

          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              background: 'rgba(200, 240, 74, 0.12)',
              border: '1px solid rgba(168, 216, 50, 0.3)',
              color: '#5a8a00'
            }}>

            Start In Minutes — No Tech Skills Needed
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{
              color: '#111827'
            }}>

            How It Works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 32
            }}
            animate={
            isInView ?
            {
              opacity: 1,
              y: 0
            } :
            {}
            }
            transition={{
              duration: 0.5,
              delay: 0.1
            }}
            className="bg-white rounded-2xl p-8 shadow-sm border"
            style={{
              borderColor: '#E5E7EB'
            }}>

            <div className="flex items-start gap-4 mb-6">
              <span
                className="text-4xl font-black"
                style={{
                  color: '#E5E7EB',
                  lineHeight: 1
                }}>

                01
              </span>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)'
              }}>

              <UserPlusIcon
                className="w-8 h-8"
                style={{
                  color: '#EA580C'
                }} />

            </div>
            <h3
              className="text-xl font-bold mb-3"
              style={{
                color: '#111827'
              }}>

              Create Account
            </h3>
            <p
              className="leading-relaxed text-sm"
              style={{
                color: '#6B7280'
              }}>

              Sign up in seconds with your email or Google account. No technical
              knowledge required — just your business details and you're ready
              to go.
            </p>
            <div
              className="mt-6 flex items-center gap-2 text-sm font-semibold"
              style={{
                color: '#C8F04A',
                filter: 'brightness(0.7)'
              }}>

              <span>Learn more</span>
              <span>→</span>
            </div>
          </motion.div>

          {/* Step 2 — highlighted */}
          <motion.div
            initial={{
              opacity: 0,
              y: 32
            }}
            animate={
            isInView ?
            {
              opacity: 1,
              y: 0
            } :
            {}
            }
            transition={{
              duration: 0.5,
              delay: 0.2
            }}
            className="rounded-2xl p-8 shadow-lg border-2 relative"
            style={{
              background: 'linear-gradient(135deg, #0B2518 0%, #1A4A2E 100%)',
              borderColor: 'rgba(200, 240, 74, 0.3)'
            }}>

            <div className="flex items-start gap-4 mb-6">
              <span
                className="text-4xl font-black"
                style={{
                  color: 'rgba(255,255,255,0.15)',
                  lineHeight: 1
                }}>

                02
              </span>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'rgba(200, 240, 74, 0.15)',
                border: '1px solid rgba(200, 240, 74, 0.25)'
              }}>

              <LinkIcon
                className="w-8 h-8"
                style={{
                  color: '#C8F04A'
                }} />

            </div>
            <h3 className="text-xl font-bold mb-3 text-white">
              Connect Your Gateway
            </h3>
            <p
              className="leading-relaxed text-sm"
              style={{
                color: 'rgba(255,255,255,0.6)'
              }}>

              Add Stripe, PayPal, Square, or any of our 20+ supported gateways.
              Enter your API credentials and we handle the rest — securely
              encrypted.
            </p>
            <div
              className="mt-6 flex items-center gap-2 text-sm font-semibold"
              style={{
                color: '#C8F04A'
              }}>

              <span>Learn more</span>
              <span>→</span>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 32
            }}
            animate={
            isInView ?
            {
              opacity: 1,
              y: 0
            } :
            {}
            }
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="bg-white rounded-2xl p-8 shadow-sm border"
            style={{
              borderColor: '#E5E7EB'
            }}>

            <div className="flex items-start gap-4 mb-6">
              <span
                className="text-4xl font-black"
                style={{
                  color: '#E5E7EB',
                  lineHeight: 1
                }}>

                03
              </span>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #F0FDF4, #BBF7D0)'
              }}>

              <CreditCardIcon
                className="w-8 h-8"
                style={{
                  color: '#16A34A'
                }} />

            </div>
            <h3
              className="text-xl font-bold mb-3"
              style={{
                color: '#111827'
              }}>

              Start Accepting Payments
            </h3>
            <p
              className="leading-relaxed text-sm"
              style={{
                color: '#6B7280'
              }}>

              Go live instantly. Monitor transactions in real-time, receive
              webhooks, and access full analytics — all from your unified
              dashboard.
            </p>
            <div
              className="mt-6 flex items-center gap-2 text-sm font-semibold"
              style={{
                color: '#C8F04A',
                filter: 'brightness(0.7)'
              }}>

              <span>Learn more</span>
              <span>→</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}