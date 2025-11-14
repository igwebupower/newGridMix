'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
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
            <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded mb-6">
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Privacy Policy
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
            <h2>1. Introduction</h2>
            <p>
              GridMix (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our real-time UK National Grid data dashboard.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>
              We do not require users to create accounts or provide personal information to use GridMix. However, if you contact us via email at <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline">hello@gridmix.co.uk</a>, we may collect:
            </p>
            <ul>
              <li>Your name</li>
              <li>Email address</li>
              <li>Message content</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>
              When you visit GridMix, we may automatically collect certain information about your device, including:
            </p>
            <ul>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Time zone setting</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>

            <h3>2.3 Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and store certain information. You can control cookie preferences through our cookie consent banner. For more details, see our <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Cookie Policy</Link>.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect in the following ways:
            </p>
            <ul>
              <li><strong>To operate and maintain our service:</strong> Ensuring GridMix functions properly and delivers real-time energy data</li>
              <li><strong>To improve our service:</strong> Understanding how users interact with our dashboard to make improvements</li>
              <li><strong>To respond to inquiries:</strong> Answering questions sent to our contact email</li>
              <li><strong>To analyze usage:</strong> Understanding traffic patterns and user behavior (only if you consent to analytics cookies)</li>
              <li><strong>To comply with legal obligations:</strong> Responding to lawful requests and legal process</li>
            </ul>

            <h2>4. Third-Party Data Sources</h2>
            <p>
              GridMix aggregates and displays data from the following third-party sources:
            </p>
            <ul>
              <li>
                <strong>Elexon BMRS API:</strong> We fetch real-time UK electricity generation data from the Balancing Mechanism Reporting Service (BMRS) operated by Elexon. This data is publicly available and anonymized.
              </li>
              <li>
                <strong>University of Sheffield Solar PVLive API:</strong> We fetch real-time and historical UK solar generation data from Sheffield Solar&apos;s PVLive service. This data is publicly available and does not contain personal information.
              </li>
            </ul>
            <p>
              We do not share your personal information with these data providers. We only retrieve publicly available energy generation data.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain automatically collected information (such as analytics data) for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
            </p>
            <p>
              Cookie preferences are stored in your browser&apos;s local storage and remain until you clear them or change your preferences.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2>7. Your Data Protection Rights (GDPR)</h2>
            <p>
              If you are a resident of the European Economic Area (EEA) or United Kingdom, you have certain data protection rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul>
              <li><strong>Right to access:</strong> You can request copies of your personal data</li>
              <li><strong>Right to rectification:</strong> You can request correction of inaccurate data</li>
              <li><strong>Right to erasure:</strong> You can request deletion of your personal data</li>
              <li><strong>Right to restrict processing:</strong> You can request restriction of processing your data</li>
              <li><strong>Right to object:</strong> You can object to our processing of your data</li>
              <li><strong>Right to data portability:</strong> You can request transfer of your data</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline">hello@gridmix.co.uk</a>.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
            </p>

            <h2>9. External Links</h2>
            <p>
              Our service may contain links to external websites (such as data source documentation). We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any external sites you visit.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
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
              <Link href="/terms" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group">
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms of Service
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
