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
      className="w-full max-w-sm h-12 sm:h-14 flex items-center justify-center gap-3 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 group border-white/20 hover:border-white/40 hover:bg-white/10 bg-transparent"
      onClick={handleClick}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      <span className="flex-1 text-center text-white">{platform}</span>
      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white/70" />
    </Button>
  );
};

export default LinkButton;