'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
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

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Related Legal Documents</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Terms of Service
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
