import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckIcon, ZapIcon } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  const { navigate } = useNavigation();
  return (
    <section id="pricing" className="py-24 bg-white" ref={ref}>
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
          className="text-center mb-4">

          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              background: 'rgba(200, 240, 74, 0.1)',
              border: '1px solid rgba(168, 216, 50, 0.25)',
              color: '#5a8a00'
            }}>

            Nigerian Market Pricing
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4"
            style={{
              color: '#111827'
            }}>

            Choose The Perfect Plan
            <span className="hidden sm:inline"> For</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Your Payment Needs
          </h2>
          <p
            className="text-lg mb-2"
            style={{
              color: '#6B7280'
            }}>

            Monthly subscription per connected gateway. Predictable pricing that
            scales with your business.
          </p>
          <p
            className="text-sm font-medium"
            style={{
              color: '#9CA3AF'
            }}>

            All prices in Nigerian Naira (₦) · VAT inclusive
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-12">
          {/* Starter */}
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
            className="rounded-2xl border p-6 sm:p-8 flex flex-col"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}>

            <div className="mb-8">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: '#F3F4F6',
                  color: '#6B7280'
                }}>

                Starter
              </div>
              <h3
                className="text-2xl font-black mb-1"
                style={{
                  color: '#111827'
                }}>

                ₦15,000
              </h3>
              <p
                className="text-sm mb-1"
                style={{
                  color: '#6B7280'
                }}>

                per month
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#9CA3AF'
                }}>

                Perfect for small businesses getting started
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Gateways
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  2 connections
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Transactions
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Up to 1,000/mo
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Analytics
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Basic
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Support
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Email
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
              'Paystack & Flutterwave',
              'Basic webhook notifications',
              'Transaction history',
              'API access',
              'Email support'].
              map((feature) =>
              <li key={feature} className="flex items-start gap-3">
                  <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: '#F3F4F6'
                  }}>

                    <CheckIcon
                    className="w-3 h-3"
                    style={{
                      color: '#6B7280'
                    }} />

                  </div>
                  <span
                  className="text-sm"
                  style={{
                    color: '#374151'
                  }}>

                    {feature}
                  </span>
                </li>
              )}
            </ul>

            <button
              onClick={() => navigate('get-started')}
              className="w-full py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 hover:border-gray-400"
              style={{
                borderColor: '#E5E7EB',
                color: '#374151',
                background: 'white'
              }}>

              Get Started
            </button>
          </motion.div>

          {/* Growth — highlighted */}
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
            className="rounded-2xl p-6 sm:p-8 flex flex-col relative pricing-highlight mt-6 md:mt-0"
            style={{
              background: 'white'
            }}>

            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
                style={{
                  background: '#C8F04A',
                  color: '#0B2518'
                }}>

                <ZapIcon className="w-3 h-3" />
                Most Popular
              </span>
            </div>

            <div className="mb-8">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: 'rgba(200, 240, 74, 0.15)',
                  color: '#5a8a00'
                }}>

                Growth
              </div>
              <h3
                className="text-2xl font-black mb-1"
                style={{
                  color: '#111827'
                }}>

                ₦35,000
              </h3>
              <p
                className="text-sm mb-1"
                style={{
                  color: '#6B7280'
                }}>

                per month
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#9CA3AF'
                }}>

                For growing businesses scaling payments
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Gateways
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  5 connections
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Transactions
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Up to 10,000/mo
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Analytics
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Advanced + Reports
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2"
                style={{
                  borderColor: '#F3F4F6'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#9CA3AF'
                  }}>

                  Support
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: '#111827'
                  }}>

                  Priority
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
              'All Nigerian gateways (5)',
              'Advanced analytics & reports',
              'Team management (5 seats)',
              'Priority support',
              'Custom webhooks',
              'CSV/Excel exports',
              'API playground'].
              map((feature) =>
              <li key={feature} className="flex items-start gap-3">
                  <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
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
                    color: '#111827'
                  }}>

                    {feature}
                  </span>
                </li>
              )}
            </ul>

            <button
              onClick={() => navigate('get-started')}
              className="lime-btn w-full py-3 rounded-xl font-bold text-sm">

              Start Free Trial
            </button>
            <p
              className="text-center text-xs mt-3"
              style={{
                color: '#9CA3AF'
              }}>

              14-day free trial included
            </p>
          </motion.div>

          {/* Business */}
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
            className="rounded-2xl border p-6 sm:p-8 flex flex-col"
            style={{
              borderColor: '#E5E7EB',
              background: 'linear-gradient(135deg, #0B2518 0%, #1A4A2E 100%)'
            }}>

            <div className="mb-8">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: 'rgba(200, 240, 74, 0.15)',
                  color: '#C8F04A'
                }}>

                Business
              </div>
              <h3 className="text-2xl font-black mb-1 text-white">₦75,000</h3>
              <p
                className="text-sm mb-1"
                style={{
                  color: 'rgba(255,255,255,0.55)'
                }}>

                per month
              </p>
              <p
                className="text-xs"
                style={{
                  color: 'rgba(255,255,255,0.4)'
                }}>

                For enterprises with unlimited needs
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: 'rgba(255,255,255,0.4)'
                  }}>

                  Gateways
                </span>
                <span className="text-sm font-semibold text-white">
                  Unlimited
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: 'rgba(255,255,255,0.4)'
                  }}>

                  Transactions
                </span>
                <span className="text-sm font-semibold text-white">
                  Unlimited
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2 border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: 'rgba(255,255,255,0.4)'
                  }}>

                  Analytics
                </span>
                <span className="text-sm font-semibold text-white">
                  Custom + Exports
                </span>
              </div>
              <div
                className="flex justify-between items-center py-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)'
                }}>

                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: 'rgba(255,255,255,0.4)'
                  }}>

                  Support
                </span>
                <span className="text-sm font-semibold text-white">
                  Dedicated
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
              'All Nigerian gateways (unlimited)',
              'Custom integrations',
              'Unlimited team seats',
              'Dedicated account manager',
              '99.9% SLA guarantee',
              'Custom reports & exports',
              'White-label option',
              'CBN compliance reporting'].
              map((feature) =>
              <li key={feature} className="flex items-start gap-3">
                  <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(200, 240, 74, 0.2)',
                    border: '1px solid rgba(200, 240, 74, 0.4)'
                  }}>

                    <CheckIcon
                    className="w-3 h-3"
                    style={{
                      color: '#C8F04A'
                    }} />

                  </div>
                  <span
                  className="text-sm"
                  style={{
                    color: 'rgba(255,255,255,0.75)'
                  }}>

                    {feature}
                  </span>
                </li>
              )}
            </ul>

            <button
              onClick={() => navigate('contact')}
              className="w-full py-3 rounded-xl font-bold text-sm border-2 transition-all duration-200"
              style={{
                borderColor: 'rgba(200, 240, 74, 0.4)',
                color: '#C8F04A',
                background: 'rgba(200, 240, 74, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(200, 240, 74, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(200, 240, 74, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              }}>

              Contact Sales
            </button>
          </motion.div>
        </div>
      </div>
    </section>);

}