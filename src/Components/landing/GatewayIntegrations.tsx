import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
export function GatewayIntegrations() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  return (
    <section
      className="py-24"
      style={{
        background: '#F8FAF8'
      }}
      ref={ref}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{
              opacity: 0,
              x: -30
            }}
            animate={
            isInView ?
            {
              opacity: 1,
              x: 0
            } :
            {}
            }
            transition={{
              duration: 0.6
            }}>

            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{
                background: 'rgba(200, 240, 74, 0.1)',
                border: '1px solid rgba(168, 216, 50, 0.25)',
                color: '#5a8a00'
              }}>

              Nigerian Payment Gateways
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight mb-6"
              style={{
                color: '#111827'
              }}>

              Accept Every Major
              <br />
              <span
                style={{
                  color: '#1A4A2E'
                }}>

                Nigerian Payment Method
              </span>
            </h2>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{
                color: '#6B7280'
              }}>

              Connect to Nigeria's leading payment processors and accept
              payments from customers across the country and beyond.
            </p>

            <div className="space-y-3">
              {[
              'Automatic failover between gateways',
              'Smart routing to minimize transaction fees',
              'Real-time NGN/USD/GBP conversion',
              'CBN-compliant transaction reporting'].
              map((item) =>
              <div key={item} className="flex items-center gap-3">
                  <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: '#C8F04A'
                  }}>

                    <CheckIcon
                    className="w-3 h-3"
                    style={{
                      color: '#0B2518'
                    }} />

                  </div>
                  <span
                  className="text-sm font-medium"
                  style={{
                    color: '#374151'
                  }}>

                    {item}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Nigerian Gateway logos */}
          <motion.div
            initial={{
              opacity: 0,
              x: 30
            }}
            animate={
            isInView ?
            {
              opacity: 1,
              x: 0
            } :
            {}
            }
            transition={{
              duration: 0.6,
              delay: 0.2
            }}>

            {/* Gateway logo cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Paystack */}
              <div
                className="flex items-center justify-center py-5 px-5 rounded-xl border bg-white"
                style={{
                  borderColor: '#E5E7EB',
                  minHeight: '80px'
                }}>

                <img
                  src="/paystack-logo-paystack-logo-AYa3s5hN.jpg"
                  alt="Paystack"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '36px',
                    maxWidth: '130px'
                  }} />

              </div>

              {/* Flutterwave */}
              <div
                className="flex items-center justify-center py-5 px-5 rounded-xl border bg-white"
                style={{
                  borderColor: '#E5E7EB',
                  minHeight: '80px'
                }}>

                <img
                  src="/flutterwave-logo-VB0pHnzp_t.jpg"
                  alt="Flutterwave"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '36px',
                    maxWidth: '130px'
                  }} />

              </div>

              {/* Interswitch */}
              <div
                className="flex items-center justify-center py-5 px-5 rounded-xl border bg-white"
                style={{
                  borderColor: '#E5E7EB',
                  minHeight: '80px'
                }}>

                <img
                  src="/5be2163617311.jpg"
                  alt="Interswitch"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '36px',
                    maxWidth: '130px'
                  }} />

              </div>

              {/* Remita */}
              <div
                className="flex items-center justify-center py-5 px-5 rounded-xl border bg-white"
                style={{
                  borderColor: '#E5E7EB',
                  minHeight: '80px'
                }}>

                <img
                  src="/Remita-Logo.webp"
                  alt="Remita"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '36px',
                    maxWidth: '130px'
                  }} />

              </div>

              {/* Monnify */}
              <div
                className="flex items-center justify-center py-5 px-5 rounded-xl border bg-white"
                style={{
                  borderColor: '#E5E7EB',
                  minHeight: '80px'
                }}>

                <img
                  src="/monnify_long_logo_97b44bd036.png"
                  alt="Monnify"
                  className="w-full object-contain"
                  style={{
                    maxHeight: '36px',
                    maxWidth: '130px'
                  }} />

              </div>

              {/* More gateways */}
              <div
                className="flex flex-col items-center justify-center py-5 px-5 rounded-xl border"
                style={{
                  borderColor: '#C8F04A',
                  background: 'rgba(200, 240, 74, 0.06)',
                  minHeight: '80px',
                  borderStyle: 'dashed'
                }}>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-lg mb-1"
                  style={{
                    background: '#C8F04A',
                    color: '#0B2518'
                  }}>

                  +
                </div>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: '#1A4A2E'
                  }}>

                  20+ More
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  & growing
                </span>
              </div>
            </div>

            {/* Payment methods */}
            <div
              className="bg-white rounded-2xl p-4 sm:p-6 border"
              style={{
                borderColor: '#E5E7EB'
              }}>

              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4"
                style={{
                  color: '#9CA3AF'
                }}>

                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                {
                  name: 'Bank Transfer',
                  color: '#1A4A2E',
                  bg: '#F0FDF4'
                },
                {
                  name: 'USSD',
                  color: '#7C3AED',
                  bg: '#FDF4FF'
                },
                {
                  name: 'Card',
                  color: '#1D4ED8',
                  bg: '#EFF6FF'
                },
                {
                  name: 'QR Code',
                  color: '#059669',
                  bg: '#F0FDF4'
                },
                {
                  name: 'Opay',
                  color: '#16A34A',
                  bg: '#F0FDF4'
                },
                {
                  name: 'PalmPay',
                  color: '#E31837',
                  bg: '#FFF1F2'
                },
                {
                  name: 'GTBank',
                  color: '#F97316',
                  bg: '#FFF7ED'
                },
                {
                  name: 'Zenith',
                  color: '#DC2626',
                  bg: '#FFF1F2'
                }].
                map((method) =>
                <div
                  key={method.name}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                  style={{
                    background: method.bg,
                    borderColor: '#E5E7EB',
                    color: method.color
                  }}>

                    {method.name}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}