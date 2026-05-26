import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  WebhookIcon,
  CodeIcon,
  UsersIcon,
  ShieldCheckIcon,
} from 'lucide-react';

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(200, 240, 74, 0.1)', border: '1px solid rgba(168, 216, 50, 0.25)', color: '#5a8a00' }}>
            Everything You Need
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: '#111827' }}>
            Powerful Features For
            <br />
            <span style={{ color: '#1A4A2E' }}>Modern Businesses</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
            From a single dashboard, manage every aspect of your payment
            infrastructure with enterprise-grade tools.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: LayoutDashboardIcon, iconColor: '#2563EB',
              iconBg: 'linear-gradient(135deg, #EFF6FF, #BFDBFE)',
              title: 'Multi-Gateway Dashboard',
              description: 'Unified view of all your payment gateways in one place. Monitor health, switch defaults, and manage credentials without switching tabs.',
              delay: 0.05,
            },
            {
              icon: BarChart3Icon, iconColor: '#16A34A',
              iconBg: 'linear-gradient(135deg, #F0FDF4, #BBF7D0)',
              title: 'Real-Time Analytics',
              description: 'Live revenue charts, transaction volumes, success rates, and gateway performance comparisons — updated in real-time as payments flow in.',
              delay: 0.1,
            },
            {
              icon: WebhookIcon, iconColor: '#EA580C',
              iconBg: 'linear-gradient(135deg, #FFF7ED, #FED7AA)',
              title: 'Webhook Management',
              description: 'Automated webhook delivery with retry logic, signature verification, and full request/response logs. Never miss a payment event again.',
              delay: 0.15,
            },
            {
              icon: CodeIcon, iconColor: '#9333EA',
              iconBg: 'linear-gradient(135deg, #FDF4FF, #E9D5FF)',
              title: 'Developer API',
              description: 'Full REST API with interactive docs, code examples in Node.js, Python, PHP, and Ruby. API playground for testing endpoints directly in-browser.',
              delay: 0.2,
            },
            {
              icon: UsersIcon, iconColor: '#E11D48',
              iconBg: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
              title: 'Team Management',
              description: 'Invite team members with granular role-based permissions: Owner, Admin, Developer, Finance, and Support. Full audit logs included.',
              delay: 0.25,
            },
            {
              icon: ShieldCheckIcon, iconColor: '#059669',
              iconBg: 'linear-gradient(135deg, #ECFDF5, #A7F3D0)',
              title: 'Enterprise Security',
              description: 'AES-256 encryption at rest, TLS 1.3 in transit, OAuth 2.0, 2FA, IP whitelisting, and rate limiting. SOC 2 compliant infrastructure.',
              delay: 0.3,
            },
          ].map(({ icon: Icon, iconColor, iconBg, title, description, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay }}
              className="group p-7 rounded-2xl border transition-all duration-300 cursor-default"
              style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
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
                style={{ background: iconBg }}>
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
