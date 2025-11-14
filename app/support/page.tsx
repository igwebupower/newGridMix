'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const donationTiers = [
    {
      amount: 3,
      icon: '☕',
      title: 'Coffee',
      description: 'Buy us a coffee',
      impact: 'Covers one day of server costs',
    },
    {
      amount: 10,
      icon: '⚡',
      title: 'Energizer',
      description: 'Power up the grid',
      impact: 'Covers one week of API calls',
    },
    {
      amount: 25,
      icon: '🌟',
      title: 'Star Supporter',
      description: 'Shine bright',
      impact: 'Covers one month of hosting',
    },
    {
      amount: 50,
      icon: '💎',
      title: 'Diamond Friend',
      description: 'Precious support',
      impact: 'Covers development tools & services',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl">
              💚
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Keep GridMix Free & Ad-Free
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Your support helps us maintain a clean, fast, and valuable resource for understanding
            the UK energy grid. No ads. No tracking. Just pure energy data.
          </p>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-8 rounded-2xl mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            What You Get (Completely Free)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Real-Time Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live UK grid mix, carbon intensity, and solar generation updated every 30 seconds
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚫</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Zero Ads
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No advertisements, no pop-ups, no interruptions to your experience
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Educational Content
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                In-depth insights about UK energy, grid technology, and the renewable transition
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cost Transparency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass p-8 rounded-2xl mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Where Your Support Goes
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌐</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Hosting & Infrastructure</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">~£30/month</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">API Calls & Data Transfer</span>
              </div>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">~£15/month</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🛠️</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Development & Maintenance</span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold">~£20/month</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔒</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Domain & SSL Certificates</span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">~£10/month</span>
            </div>
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <span className="font-bold text-lg">Total Monthly Cost</span>
                <span className="font-bold text-2xl">~£75/month</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            100% of donations go directly to keeping GridMix running. No salaries, no profits.
          </p>
        </motion.div>

        {/* Donation Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Choose Your Support Level
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationTiers.map((tier, index) => (
              <motion.button
                key={tier.amount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                onClick={() => setSelectedAmount(tier.amount)}
                className={`glass p-6 rounded-xl text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedAmount === tier.amount
                    ? 'ring-4 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : ''
                }`}
              >
                <div className="text-5xl mb-4">{tier.icon}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  £{tier.amount}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                  {tier.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {tier.description}
                </p>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {tier.impact}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mt-8 glass p-6 rounded-xl max-w-md mx-auto">
            <label className="block text-center mb-3 font-semibold text-gray-900 dark:text-gray-100">
              Or choose your own amount:
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">£</span>
              <input
                type="number"
                min="1"
                placeholder="Any amount helps"
                onChange={(e) => setSelectedAmount(Number(e.target.value) || null)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Payment Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass p-8 rounded-2xl mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Ways to Support
          </h2>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Stripe - Primary */}
            <div className="glass p-6 rounded-xl border-2 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Credit/Debit Card</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Secure payment via Stripe</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                  Recommended
                </span>
              </div>
              <button
                disabled={!selectedAmount}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedAmount
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedAmount ? `Donate £${selectedAmount} via Stripe` : 'Select an amount above'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 text-center">
                One-time payment • Secure & encrypted • No account needed
              </p>
            </div>

            {/* PayPal */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PayPal</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">PayPal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Donate with your PayPal account</p>
                </div>
              </div>
              <button
                disabled={!selectedAmount}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedAmount
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedAmount ? `Donate £${selectedAmount} via PayPal` : 'Select an amount above'}
              </button>
            </div>

            {/* Buy Me a Coffee */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                  <span className="text-2xl">☕</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Buy Me a Coffee</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quick and easy one-time support</p>
                </div>
              </div>
              <a
                href="https://www.buymeacoffee.com/gridmix"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white text-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Support on Buy Me a Coffee
              </a>
            </div>

            {/* GitHub Sponsors */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-800 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">GitHub Sponsors</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recurring monthly support</p>
                </div>
              </div>
              <a
                href="https://github.com/sponsors/gridmix"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-lg font-semibold bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white text-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sponsor on GitHub
              </a>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              <strong>Note:</strong> Payment integration is currently being set up. In the meantime, you can support us via{' '}
              <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                hello@gridmix.co.uk
              </a>
              {' '}for alternative payment methods.
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass p-8 rounded-2xl mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Is GridMix really free?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! GridMix is completely free to use with no ads, no tracking, and no premium features locked behind paywalls. We believe energy data should be accessible to everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Do I get anything extra for donating?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No perks or rewards - and that&apos;s intentional! We want GridMix to remain equal for all users. Your donation simply helps keep the service running for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Are donations recurring or one-time?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Most donation methods are one-time payments. GitHub Sponsors offers monthly recurring support if you prefer. You choose what works best for you!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Can I see how donations are used?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re committed to transparency. All hosting costs and infrastructure expenses are outlined above. 100% goes to keeping GridMix running.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                What if I can&apos;t donate?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                That&apos;s absolutely fine! GridMix will remain free regardless. You can still help by sharing GridMix with others who might find it useful, or providing feedback to help us improve.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Thank You Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass p-12 rounded-2xl text-center"
        >
          <div className="text-6xl mb-6">🙏</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Thank You for Your Support
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Every contribution, no matter the size, makes a real difference. You&apos;re helping keep energy data accessible, transparent, and ad-free for everyone interested in the UK&apos;s renewable transition.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/insights"
              className="px-6 py-3 glass border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
            >
              Read Our Insights
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
