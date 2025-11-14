'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-8 md:p-12 rounded-2xl"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
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

            <h3>5.2 Third-Party Data</h3>
            <p>
              Data provided by Elexon BMRS and University of Sheffield Solar PVLive remains the property of those respective organizations and is subject to their terms of use.
            </p>

            <h3>5.3 Attribution</h3>
            <p>
              When sharing or republishing data or insights from GridMix, please provide appropriate attribution to both GridMix and the original data sources.
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

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Related Legal Documents</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
