import React from 'react';
import { Separator } from '../components/ui/separator';
import LinkButton from '../components/LinkButton';
import LinkCard from '../components/LinkCard';
import { mockLinks } from '../data/mockLinks';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gandi's Links
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Connect with me across all platforms
          </p>
        </div>

        {/* Option B: Button-style links */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Option B: Button Style
            </h2>
            <p className="text-gray-600">Clean button-style links with hover effects</p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            {mockLinks.map((link) => (
              <LinkButton
                key={`button-${link.id}`}
                platform={link.platform}
                url={link.url}
                icon={link.icon}
                variant="outline"
              />
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* Option C: Card-style layout */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Option C: Card Style
            </h2>
            <p className="text-gray-600">Card layout with descriptions and details</p>
          </div>
          
          <div className="grid gap-4 max-w-2xl mx-auto">
            {mockLinks.map((link) => (
              <LinkCard
                key={`card-${link.id}`}
                platform={link.platform}
                url={link.url}
                icon={link.icon}
                description={link.description}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Choose your preferred style above
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;