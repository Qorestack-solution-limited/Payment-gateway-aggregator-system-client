import React from 'react';
import {
  ShieldCheckIcon,
  TwitterIcon,
  GithubIcon,
  LinkedinIcon } from
'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
export function Footer() {
  const { navigate } = useNavigation();
  const linkStyle = {
    color: 'rgba(255,255,255,0.45)',
    cursor: 'pointer'
  };
  const FooterLink = ({
    label,
    onClick



  }: {label: string;onClick: () => void;}) =>
  <li>
      <button
      onClick={onClick}
      className="text-sm transition-colors duration-200 text-left focus:outline-none"
      style={linkStyle}
      onMouseEnter={(e) => e.currentTarget.style.color = '#C8F04A'}
      onMouseLeave={(e) =>
      e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
      }>

        {label}
      </button>
    </li>;

  return (
    <footer
      style={{
        background: '#060F0A'
      }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 mb-4 focus:outline-none">

              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: '#C8F04A'
                }}>

                <ShieldCheckIcon
                  className="w-5 h-5"
                  style={{
                    color: '#0B2518'
                  }} />

              </div>
              <span className="text-xl font-bold text-white">PayOrch</span>
            </button>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{
                color: 'rgba(255,255,255,0.45)'
              }}>

              Nigeria's unified payment orchestration platform. Manage Paystack,
              Flutterwave, Interswitch and more from one powerful dashboard.
            </p>
            <div className="flex items-center gap-3">
              {[
              {
                icon: <TwitterIcon className="w-4 h-4" />,
                label: 'Twitter'
              },
              {
                icon: <GithubIcon className="w-4 h-4" />,
                label: 'GitHub'
              },
              {
                icon: <LinkedinIcon className="w-4 h-4" />,
                label: 'LinkedIn'
              }].
              map(({ icon, label }) =>
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                  'rgba(200, 240, 74, 0.12)';
                  e.currentTarget.style.color = '#C8F04A';
                  e.currentTarget.style.borderColor =
                  'rgba(200, 240, 74, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}>

                  {icon}
                </a>
              )}
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <FooterLink label="Dashboard" onClick={() => navigate('home')} />
              <FooterLink
                label="Transactions"
                onClick={() => navigate('home')} />

              <FooterLink label="Analytics" onClick={() => navigate('home')} />
              <FooterLink
                label="Gateway Management"
                onClick={() => navigate('home')} />

              <FooterLink label="API Docs" onClick={() => navigate('docs')} />
              <FooterLink label="Pricing" onClick={() => navigate('home')} />
            </ul>
          </div>

          {/* Developers */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-white mb-4">
              Developers
            </h4>
            <ul className="space-y-3">
              <FooterLink
                label="API Reference"
                onClick={() => navigate('docs')} />

              <FooterLink label="SDKs" onClick={() => navigate('docs')} />
              <FooterLink label="Webhooks" onClick={() => navigate('docs')} />
              <FooterLink label="Playground" onClick={() => navigate('docs')} />
              <FooterLink label="Changelog" onClick={() => navigate('docs')} />
              <FooterLink label="Status" onClick={() => navigate('home')} />
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <FooterLink label="About" onClick={() => navigate('home')} />
              <FooterLink label="Blog" onClick={() => navigate('blog')} />
              <FooterLink label="Careers" onClick={() => navigate('home')} />
              <FooterLink label="Contact" onClick={() => navigate('contact')} />
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <FooterLink
                label="Privacy Policy"
                onClick={() => navigate('privacy')} />

              <FooterLink
                label="Terms of Service"
                onClick={() => navigate('terms')} />

              <FooterLink
                label="Compliance"
                onClick={() => navigate('compliance')} />

              <FooterLink
                label="Cookie Policy"
                onClick={() => navigate('privacy')} />

              <FooterLink
                label="NDPR Notice"
                onClick={() => navigate('compliance')} />

            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>

          <p
            className="text-sm"
            style={{
              color: 'rgba(255,255,255,0.3)'
            }}>

            © 2026 PayOrch Technologies Ltd. RC: 1234567. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#C8F04A'
                }} />

              <span
                className="text-xs"
                style={{
                  color: 'rgba(255,255,255,0.35)'
                }}>

                All systems operational
              </span>
            </div>
            <span
              className="text-xs"
              style={{
                color: 'rgba(255,255,255,0.2)'
              }}>

              CBN Licensed · NDPR Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>);

}