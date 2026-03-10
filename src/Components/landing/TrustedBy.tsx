import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
const companies = [
{
  name: 'Reddit',
  color: '#FF4500',
  weight: '700'
},
{
  name: 'TESLA',
  color: '#CC0000',
  weight: '900',
  spacing: '0.15em'
},
{
  name: 'Uber',
  color: '#000000',
  weight: '900'
},
{
  name: 'NETFLIX',
  color: '#E50914',
  weight: '900'
},
{
  name: 'Mailchimp',
  color: '#FFE01B',
  bg: '#241C15',
  weight: '700'
},
{
  name: 'slack',
  color: '#4A154B',
  weight: '700'
},
{
  name: 'Stripe',
  color: '#635BFF',
  weight: '700'
}];

export function TrustedBy() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
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
          className="text-center mb-10">

          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{
              color: '#6B7280'
            }}>

            Loved By Next-Gen B2B{' '}
            <span
              style={{
                color: '#C8F04A',
                WebkitTextStroke: '0.5px #A8D832'
              }}>

              SaaS
            </span>{' '}
            Companies
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0
          }}
          animate={
          isInView ?
          {
            opacity: 1
          } :
          {}
          }
          transition={{
            duration: 0.6,
            delay: 0.2
          }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">

          {companies.map((company, i) =>
          <motion.div
            key={company.name}
            initial={{
              opacity: 0,
              y: 10
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
              duration: 0.4,
              delay: 0.1 * i
            }}>

              <span
              className="text-xl select-none"
              style={{
                color: company.color,
                fontWeight: company.weight,
                letterSpacing: company.spacing || 'normal',
                opacity: 0.75,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}>

                {company.name}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>);

}