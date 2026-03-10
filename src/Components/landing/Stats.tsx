import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px'
  });
  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #0B2518 0%, #1A4A2E 100%)'
      }}
      ref={ref}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Stat 1 */}
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
              duration: 0.5,
              delay: 0
            }}
            className="text-center px-2">

            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2"
              style={{
                color: '#C8F04A'
              }}>

              99.9%
            </div>
            <div
              className="text-xs sm:text-sm font-medium"
              style={{
                color: 'rgba(255,255,255,0.6)'
              }}>

              Uptime SLA
            </div>
          </motion.div>

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
              duration: 0.5,
              delay: 0.1
            }}
            className="text-center px-2">

            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2"
              style={{
                color: '#C8F04A'
              }}>

              ₦2B+
            </div>
            <div
              className="text-xs sm:text-sm font-medium"
              style={{
                color: 'rgba(255,255,255,0.6)'
              }}>

              Processed
            </div>
          </motion.div>

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
              duration: 0.5,
              delay: 0.2
            }}
            className="text-center px-2">

            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2"
              style={{
                color: '#C8F04A'
              }}>

              10K+
            </div>
            <div
              className="text-xs sm:text-sm font-medium"
              style={{
                color: 'rgba(255,255,255,0.6)'
              }}>

              Businesses
            </div>
          </motion.div>

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
              duration: 0.5,
              delay: 0.3
            }}
            className="text-center px-2">

            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2"
              style={{
                color: '#C8F04A'
              }}>

              &lt;200ms
            </div>
            <div
              className="text-xs sm:text-sm font-medium"
              style={{
                color: 'rgba(255,255,255,0.6)'
              }}>

              API Response
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}