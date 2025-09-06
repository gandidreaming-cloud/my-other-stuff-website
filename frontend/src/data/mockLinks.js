import { 
  Youtube, 
  Music2, 
  Instagram, 
  CreditCard, 
  Coffee, 
  FileText 
} from 'lucide-react';

export const mockLinks = [
  {
    id: 1,
    platform: 'YouTube',
    url: 'https://youtube.com/channel/UCdiGv0cPSrxBW2yYMPW8HmA?sub_confirmation=1',
    icon: Youtube,
    description: 'Subscribe to my channel'
  },
  {
    id: 2,
    platform: 'TikTok',
    url: 'https://www.tiktok.com/@chances_are_low',
    icon: Music2,
    description: 'Follow me on TikTok'
  },
  {
    id: 3,
    platform: 'Instagram',
    url: 'https://www.instagram.com/chances_are_low',
    icon: Instagram,
    description: 'Check out my posts'
  },
  {
    id: 4,
    platform: 'PayPal',
    url: 'https://www.paypal.com/paypalme/armengandilian',
    icon: CreditCard,
    description: 'Send me a payment'
  },
  {
    id: 5,
    platform: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/chances_are_low',
    icon: Coffee,
    description: 'Support my work'
  },
  {
    id: 6,
    platform: 'Google Doc',
    url: 'https://docs.google.com/document/d/1-91pFp-uhKczPvELfqqLn6l-x_ecR712S8_FHEMao0w/edit',
    icon: FileText,
    description: 'View my document'
  }
];