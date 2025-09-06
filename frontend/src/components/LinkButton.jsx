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
      className="w-full max-w-md h-14 flex items-center justify-center gap-3 text-base font-medium transition-all duration-200 hover:scale-105 group"
      onClick={handleClick}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-center">{platform}</span>
      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>
  );
};

export default LinkButton;