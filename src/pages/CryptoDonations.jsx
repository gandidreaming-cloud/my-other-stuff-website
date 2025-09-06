import React from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CryptoDonations = () => {
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = useState(null);

  const cryptoOptions = [
    {
      id: 1,
      name: 'BTC (Bitcoin)',
      address: 'bc1qj57qncyxvzhnw99v3nrszehy8tj5e07s7s3yf2',
      shortName: 'BTC'
    },
    {
      id: 2,
      name: 'ETH (Ethereum)',
      address: '0xdc99F172F1901D6C465fe9d160c15738218271B1',
      shortName: 'ETH'
    },
    {
      id: 3,
      name: 'USDT (TRC20)',
      address: 'TMrbREm17TQts4mkSGcXjgmhB2uoGu42TA',
      shortName: 'USDT'
    },
    {
      id: 4,
      name: 'Solana (SOL)',
      address: 'BxZ4nS9yxDC6hBoY34aMFhdZhy6hVb7zuiyUqmdHoZAC',
      shortName: 'SOL'
    }
  ];

  const copyToClipboard = async (address, id) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(id);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center mb-8 sm:mb-12">
          <Button
            variant="ghost"
            className="p-2 hover:bg-white/10 text-white mr-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Crypto Donations
          </h1>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-white/70 text-sm sm:text-base">
            Support my work with cryptocurrency donations
          </p>
        </div>

        {/* Crypto Options */}
        <div className="space-y-4">
          {cryptoOptions.map((crypto) => (
            <Card 
              key={crypto.id} 
              className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {crypto.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => copyToClipboard(crypto.address, crypto.id)}
                  >
                    {copiedAddress === crypto.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div 
                  className="bg-black/50 rounded-lg p-3 sm:p-4 border border-white/10 cursor-pointer hover:border-white/30 transition-colors"
                  onClick={() => copyToClipboard(crypto.address, crypto.id)}
                >
                  <p className="text-white/90 font-mono text-xs sm:text-sm break-all leading-relaxed">
                    {crypto.address}
                  </p>
                </div>
                
                {copiedAddress === crypto.id && (
                  <p className="text-green-400 text-xs mt-2 text-center">
                    Address copied to clipboard!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8">
          <p className="text-white/40 text-xs sm:text-sm">
            Thank you for your support! 🖤
          </p>
        </div>
      </div>
    </div>
  );
};

export default CryptoDonations;