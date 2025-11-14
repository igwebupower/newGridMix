'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  hasConsent,
  acceptAllCookies,
  rejectOptionalCookies,
} from '@/lib/cookies';
import { CookieSettings } from './CookieSettings';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasUserConsent = hasConsent();
    setShowBanner(!hasUserConsent);
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    rejectOptionalCookies();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    setShowBanner(false);
    setShowSettings(false);
  };

  return (
    <>
      {/* Cookie Settings Modal */}
      <CookieSettings
        isOpen={showSettings}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
      />

      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="glass border border-gray-200/20 dark:border-gray-700/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="flex-shrink-0 mt-1">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                          We value your privacy
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          We use cookies to enhance your browsing experience, analyze site traffic,
                          and personalize content. You can choose to accept all cookies or customize
                          your preferences. Your data is safe with us.{' '}
                          <a
                            href="/privacy"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Learn more
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-sm"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleCustomize}
                      className="px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 text-sm"
                    >
                      Customize
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                    >
                      Accept All
                    </button>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    By clicking &quot;Accept All&quot;, you agree to the storing of cookies on your
                    device to enhance site navigation and analyze site usage. Essential cookies are
                    always active and cannot be disabled.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
