'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { CookieSettings } from '@/components/CookieSettings';

export default function CookiePage() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <CookieSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => setShowSettings(false)}
      />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 px-8 md:px-12 py-12 border-b border-gray-200 dark:border-gray-800">
            <div className="inline-block px-3 py-1 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded mb-6">
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Cookie Policy
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
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>

            <h2>2. How GridMix Uses Cookies</h2>
            <p>
              GridMix uses cookies to enhance your browsing experience, analyze site usage, and remember your preferences. We use cookies for the following purposes:
            </p>

            <h3>2.1 Necessary Cookies (Essential)</h3>
            <p>
              These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul>
              <li>Cookie consent preferences</li>
              <li>Session management</li>
              <li>Security cookies</li>
            </ul>
            <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <strong>Note:</strong> Necessary cookies cannot be disabled as they are required for the basic functionality of the website.
            </p>

            <h3>2.2 Analytics Cookies (Performance)</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the website experience.
            </p>
            <p>
              <strong>We may collect:</strong>
            </p>
            <ul>
              <li>Pages visited and time spent on pages</li>
              <li>How you arrived at the website</li>
              <li>What device and browser you&apos;re using</li>
              <li>General location (country/city level)</li>
            </ul>
            <p>
              <strong>These cookies do NOT:</strong>
            </p>
            <ul>
              <li>Collect personally identifiable information</li>
              <li>Track you across other websites</li>
              <li>Store sensitive data</li>
            </ul>

            <h3>2.3 Marketing Cookies (Targeting)</h3>
            <p>
              These cookies are used to track visitors across websites to display relevant advertisements. While GridMix does not currently use marketing cookies, this category is available for future use.
            </p>
            <p>
              <strong>If enabled, marketing cookies may:</strong>
            </p>
            <ul>
              <li>Show you relevant content based on your interests</li>
              <li>Limit the number of times you see an advertisement</li>
              <li>Help measure advertising campaign effectiveness</li>
            </ul>

            <h3>2.4 Preference Cookies (Functionality)</h3>
            <p>
              These cookies allow the website to remember choices you make (such as theme preferences or language) and provide enhanced, more personalized features.
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul>
              <li>Dark mode / light mode preference</li>
              <li>Language selection</li>
              <li>Region preferences</li>
            </ul>

            <h2>3. Third-Party Cookies</h2>
            <p>
              GridMix may use third-party services that set cookies on your device. These include:
            </p>
            <ul>
              <li>
                <strong>Analytics Services:</strong> To understand how users interact with our dashboard (only if you consent to analytics cookies)
              </li>
            </ul>
            <p>
              We do not control these third-party cookies. Please review the privacy policies of third-party services for more information about their use of cookies.
            </p>

            <h2>4. How Long Do Cookies Last?</h2>

            <h3>Session Cookies</h3>
            <p>
              These are temporary cookies that expire when you close your browser. They help the website function during your visit.
            </p>

            <h3>Persistent Cookies</h3>
            <p>
              These cookies remain on your device for a set period or until you manually delete them. They remember your preferences across multiple visits.
            </p>

            <h2>5. Managing Your Cookie Preferences</h2>

            <h3>5.1 Cookie Consent Banner</h3>
            <p>
              When you first visit GridMix, you&apos;ll see a cookie consent banner where you can:
            </p>
            <ul>
              <li>Accept all cookies</li>
              <li>Reject optional cookies</li>
              <li>Customize your cookie preferences</li>
            </ul>

            <h3>5.2 Change Your Preferences</h3>
            <p>
              You can change your cookie preferences at any time by:
            </p>
            <div className="not-prose my-6">
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Manage Cookie Preferences
              </button>
            </div>

            <h3>5.3 Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
            </p>
            <p>
              <strong>How to manage cookies in popular browsers:</strong>
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Microsoft Edge</a></li>
            </ul>

            <h2>6. Do Not Track Signals</h2>
            <p>
              Some browsers support a &quot;Do Not Track&quot; (DNT) feature that sends a signal to websites you visit indicating you do not wish to be tracked. We respect DNT signals and will not track users who have enabled this feature.
            </p>

            <h2>7. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.
            </p>

            <h2>8. Your Rights Under GDPR</h2>
            <p>
              If you are in the European Economic Area (EEA) or United Kingdom, you have certain rights regarding cookies and tracking:
            </p>
            <ul>
              <li>The right to withdraw consent at any time</li>
              <li>The right to object to processing</li>
              <li>The right to lodge a complaint with a supervisory authority</li>
            </ul>

            <h2>9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us:
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
              <Link href="/terms" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group">
                <svg className="w-4 h-4 mr-2 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
