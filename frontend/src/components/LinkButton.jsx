import React from 'react';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

const LinkButton = ({ platform, url, icon: Icon, variant = "outline" }) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant={variant}
      className="w-full max-w-sm h-12 sm:h-14 flex items-center justify-center gap-3 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 group border-gray-300 hover:border-gray-500 hover:bg-gray-50"
      onClick={handleClick}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
      <span className="flex-1 text-center text-gray-900">{platform}</span>
      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
    </Button>
  );
};

export default LinkButton;