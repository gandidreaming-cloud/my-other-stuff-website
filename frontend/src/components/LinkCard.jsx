import React from 'react';
import { Card, CardContent } from './ui/card';
import { ExternalLink } from 'lucide-react';

const LinkCard = ({ platform, url, icon: Icon, description }) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group border-gray-200 hover:border-gray-400"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900">{platform}</h3>
          {description && (
            <p className="text-sm text-gray-600 truncate">{description}</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </CardContent>
    </Card>
  );
};

export default LinkCard;