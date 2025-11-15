'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 px-8 md:px-12 py-12 border-b border-gray-200 dark:border-gray-800">
            <div className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded mb-6">
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Terms of Service
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 md:px-12 py-12 prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-gray-800 dark:prose-h3:text-gray-200
            prose-p:text-lg prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-6
            prose-ul:my-6 prose-ul:space-y-3
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using GridMix (&quot;Service,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              GridMix is a real-time UK National Grid data visualization dashboard that provides:
            </p>
            <ul>
              <li>Live electricity generation mix data</li>
              <li>Carbon intensity monitoring</li>
              <li>Solar generation tracking</li>
              <li>Interconnector flow visualization</li>
              <li>Historical trends and forecasts</li>
              <li>Educational insights about UK energy</li>
            </ul>

            <h2>3. Data Sources and Accuracy</h2>

            <h3>3.1 Third-Party Data</h3>
            <p>
              GridMix aggregates data from the following sources:
            </p>
            <ul>
              <li>
                <strong>Elexon BMRS:</strong> Real-time balancing mechanism reporting data from the UK electricity system operator
              </li>
              <li>
                <strong>University of Sheffield Solar PVLive:</strong> Real-time and historical UK solar photovoltaic generation estimates
              </li>
            </ul>

            <h3>3.2 Data Accuracy Disclaimer</h3>
            <p>
              While we strive to provide accurate and up-to-date information, we do not guarantee the accuracy, completeness, or reliability of any data displayed on GridMix. The Service is provided for informational and educational purposes only.
            </p>
            <p>
              <strong>You should not rely on GridMix data for:</strong>
            </p>
            <ul>
              <li>Trading or investment decisions</li>
              <li>Critical infrastructure operations</li>
              <li>Emergency response planning</li>
              <li>Legal or regulatory compliance</li>
            </ul>

            <h2>4. Acceptable Use</h2>

            <h3>4.1 Permitted Use</h3>
            <p>
              You may use GridMix for:
            </p>
            <ul>
              <li>Personal educational purposes</li>
              <li>Research and analysis</li>
              <li>General information gathering</li>
              <li>Sharing insights (with attribution)</li>
            </ul>

            <h3>4.2 Prohibited Use</h3>
            <p>
              You agree NOT to:
            </p>
            <ul>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to scrape or download large amounts of data</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Impersonate GridMix or misrepresent your relationship with us</li>
              <li>Transmit viruses, malware, or harmful code</li>
            </ul>

            <h2>5. Intellectual Property Rights</h2>

            <h3>5.1 Service Content</h3>
            <p>
              The Service and its original content (excluding data from third-party sources), features, and functionality are owned by GridMix and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3>5.2 Third-Party Data Licenses</h3>
            <p>
              Data provided by third-party sources remains the property of those respective organizations and is subject to their terms of use:
            </p>
            <ul>
              <li>
                <strong>Elexon BMRS Data:</strong> Data from the Balancing Mechanism Reporting Service (BMRS) is used under the{' '}
                <a
                  href="https://www.elexon.co.uk/bsc/data/balancing-mechanism-reporting-agent/copyright-licence-bmrs-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Elexon BMRS Data Copyright Licence
                </a>
                . Elexon Limited owns the copyright and database rights in the BMRS data.
              </li>
              <li>
                <strong>Sheffield Solar PVLive Data:</strong> Solar generation data is provided by the University of Sheffield&apos;s PVLive service and is subject to their terms of use.
              </li>
            </ul>

            <h3>5.3 Data Attribution Requirements</h3>
            <p>
              In accordance with the Elexon BMRS Data Copyright Licence, we acknowledge that:
            </p>
            <ul>
              <li>Balancing Mechanism Reporting Service data is © Elexon Limited</li>
              <li>BMRS data is used under licence from Elexon Limited</li>
              <li>GridMix is not affiliated with or endorsed by Elexon Limited</li>
            </ul>
            <p>
              When sharing or republishing data or insights from GridMix, please provide appropriate attribution to both GridMix and the original data sources (Elexon BMRS and Sheffield Solar).
            </p>

            <h2>6. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. GRIDMIX MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>Warranties of NON-INFRINGEMENT</li>
              <li>Warranties that THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE</li>
              <li>Warranties regarding the ACCURACY OR RELIABILITY of data</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GRIDMIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
            </p>
            <ul>
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, or malware that may be transmitted through the Service</li>
              <li>Any errors or omissions in any content or data</li>
              <li>Any loss or damage arising from your reliance on data provided by the Service</li>
            </ul>

            <h2>8. Service Availability</h2>
            <p>
              We strive to maintain continuous service availability but cannot guarantee uninterrupted access. The Service may be unavailable due to:
            </p>
            <ul>
              <li>Scheduled maintenance</li>
              <li>Technical difficulties</li>
              <li>Third-party API outages</li>
              <li>Force majeure events</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service at any time without notice or liability.
            </p>

            <h2>9. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>. Please review it to understand how we collect, use, and protect your information.
            </p>

            <h2>10. Links to Third-Party Websites</h2>
            <p>
              The Service may contain links to third-party websites or services (such as data source documentation) that are not owned or controlled by GridMix. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
            </p>
            <p>
              By continuing to access or use the Service after revisions become effective, you agree to be bound by the revised terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>

            <h2>13. Dispute Resolution</h2>
            <p>
              If you have any concerns or disputes about the Service, please contact us first at <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline">hello@gridmix.co.uk</a> to seek resolution informally.
            </p>

            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h2>15. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and GridMix regarding the use of the Service.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul>
              <li>By email: <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline">hello@gridmix.co.uk</a></li>
            </ul>

          </div>

          {/* Footer Links */}
          <div className="px-8 md:px-12 py-8 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
              Related Legal Documents
            </h3>
            <div className="flex flex-wrap gap-6">
              <Link href="/privacy" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group">
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privacy Policy
              </Link>
              <Link href="/cookies" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group">
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Cookie Policy
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
