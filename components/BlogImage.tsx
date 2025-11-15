'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogImageProps {
  src: string;
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  priority?: boolean;
}

export function BlogImage({
  src,
  alt,
  caption,
  size = 'large',
  priority = false
}: BlogImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    small: 'max-w-md mx-auto',
    medium: 'max-w-2xl mx-auto',
    large: 'max-w-4xl mx-auto',
    full: 'w-full',
  };

  return (
    <>
      <figure className={`my-8 md:my-12 ${sizeClasses[size]}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
          )}

          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <img
              src={src}
              alt={alt}
              className={`w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsLoading(false)}
              loading={priority ? 'eager' : 'lazy'}
            />

            {/* Zoom overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        {caption && (
          <figcaption className="mt-4 text-center text-sm md:text-base text-gray-600 dark:text-gray-400 italic px-4">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setIsOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Close image"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Full-size image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              />

              {/* Caption in lightbox */}
              {caption && (
                <div className="mt-4 text-center text-white text-sm md:text-base px-4">
                  {caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple wrapper for markdown images that extracts caption from alt text
// Usage in markdown: ![Alt text|Caption text](image.jpg)
export function MarkdownImage(props: any) {
  const { src, alt } = props;

  // Check if alt text contains a caption separator (|)
  const [altText, caption] = alt?.includes('|')
    ? alt.split('|').map((s: string) => s.trim())
    : [alt, undefined];

  // Determine size from alt text modifiers
  let size: 'small' | 'medium' | 'large' | 'full' = 'large';
  if (altText?.toLowerCase().includes('[small]')) {
    size = 'small';
  } else if (altText?.toLowerCase().includes('[medium]')) {
    size = 'medium';
  } else if (altText?.toLowerCase().includes('[full]')) {
    size = 'full';
  }

  // Clean alt text from size modifiers
  const cleanAlt = altText?.replace(/\[(small|medium|large|full)\]/gi, '').trim();

  return <BlogImage src={src} alt={cleanAlt || ''} caption={caption} size={size} />;
}
