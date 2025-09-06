import React from 'react';
import LinkButton from '../components/LinkButton';
import { mockLinks } from '../data/mockLinks';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-md sm:max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Gandi's Links
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Connect with me across all platforms
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {mockLinks.map((link) => (
            <LinkButton
              key={link.id}
              platform={link.platform}
              url={link.url}
              icon={link.icon}
              variant="outline"
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-gray-400">
            © 2025 Gandi's Links
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;