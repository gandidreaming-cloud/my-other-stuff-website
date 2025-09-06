import { 
  Youtube, 
  Music2, 
  Instagram, 
  CreditCard, 
  Coffee, 
  Coins 
} from 'lucide-react';

export const mockLinks = [
  {
    id: 1,
    platform: 'YouTube',
    url: 'https://youtube.com/channel/UCdiGv0cPSrxBW2yYMPW8HmA?sub_confirmation=1',
    icon: Youtube,
    type: 'external'
  },
  {
    id: 2,
    platform: 'TikTok',
    url: 'https://www.tiktok.com/@chances_are_low',
    icon: Music2,
    type: 'external'
  },
  {
    id: 3,
    platform: 'Instagram',
    url: 'https://www.instagram.com/chances_are_low',
    icon: Instagram,
    type: 'external' 
  },
  {
    id: 4,
    platform: 'PayPal',
    url: 'https://www.paypal.com/paypalme/armengandilian',
    icon: CreditCard,
    type: 'external'
  },
  {
    id: 5,
    platform: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/chances_are_low',
    icon: Coffee,
    type: 'external'
  },
  {
    id: 6,
    platform: 'Crypto Donations',
    url: '/crypto-donations',
    icon: Coins,
    type: 'internal'
  }
];