import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  WebhookIcon,
  CodeIcon,
  UsersIcon,
  ShieldCheckIcon } from
'lucide-react';
type Feature = {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
};
export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  return (
    <section id="features" className="py-24 bg-white" ref={ref}>
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
              background: 'rgba(200, 240, 74, 0.1)',
              border: '1px solid rgba(168, 216, 50, 0.25)',
              color: '#5a8a00'
            }}>

            Everything You Need
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-4"
            style={{
              color: '#111827'
            }}>

            Powerful Features For
            <br />
            <span
              style={{
                color: '#1A4A2E'
              }}>

              Modern Businesses
            </span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{
              color: '#6B7280'
            }}>

            From a single dashboard, manage every aspect of your payment
            infrastructure with enterprise-grade tools.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
              delay: 0.05
            }}
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #EFF6FF, #BFDBFE)'
              }}>

              <LayoutDashboardIcon
                className="w-6 h-6"
                style={{
                  color: '#2563EB'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Multi-Gateway Dashboard
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              Unified view of all your payment gateways in one place. Monitor
              health, switch defaults, and manage credentials without switching
              tabs.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #F0FDF4, #BBF7D0)'
              }}>

              <BarChart3Icon
                className="w-6 h-6"
                style={{
                  color: '#16A34A'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Real-Time Analytics
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              Live revenue charts, transaction volumes, success rates, and
              gateway performance comparisons — updated in real-time as payments
              flow in.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
              delay: 0.15
            }}
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)'
              }}>

              <WebhookIcon
                className="w-6 h-6"
                style={{
                  color: '#EA580C'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Webhook Management
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              Automated webhook delivery with retry logic, signature
              verification, and full request/response logs. Never miss a payment
              event again.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #FDF4FF, #E9D5FF)'
              }}>

              <CodeIcon
                className="w-6 h-6"
                style={{
                  color: '#9333EA'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Developer API
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              Full REST API with interactive docs, code examples in Node.js,
              Python, PHP, and Ruby. API playground for testing endpoints
              directly in-browser.
            </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
              delay: 0.25
            }}
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)'
              }}>

              <UsersIcon
                className="w-6 h-6"
                style={{
                  color: '#E11D48'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Team Management
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              Invite team members with granular role-based permissions: Owner,
              Admin, Developer, Finance, and Support. Full audit logs included.
            </p>
          </motion.div>

          {/* Card 6 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
            className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
            style={{
              borderColor: '#E5E7EB',
              background: '#FAFAFA'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200, 240, 74, 0.4)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #ECFDF5, #A7F3D0)'
              }}>

              <ShieldCheckIcon
                className="w-6 h-6"
                style={{
                  color: '#059669'
                }} />

            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{
                color: '#111827'
              }}>

              Enterprise Security
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: '#6B7280'
              }}>

              AES-256 encryption at rest, TLS 1.3 in transit, OAuth 2.0, 2FA, IP
              whitelisting, and rate limiting. SOC 2 compliant infrastructure.
            </p>
          </motion.div>
        </div>
      </div>
    </section>);

}