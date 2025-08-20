'use client';

import { PriceHistoryPoint } from '@/lib/types';

interface PriceChartProps {
  data: PriceHistoryPoint[];
  height?: number;
  showVolume?: boolean;
}

export default function PriceChart({ data, height = 200, showVolume = false }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-gray-50 rounded border flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        No price data available
      </div>
    );
  }

  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate price range
  const prices = sortedData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Calculate volume range if showing volume
  let volumeRange = 1;
  if (showVolume) {
    const volumes = sortedData.map(d => d.volume);
    const maxVolume = Math.max(...volumes);
    volumeRange = maxVolume;
  }

  // Generate SVG path for price line
  const generatePricePath = () => {
    const width = 100;
    const height = 80;
    const points = sortedData.map((point, index) => {
      const x = (index / (sortedData.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate SVG path for volume bars
  const generateVolumePath = () => {
    if (!showVolume) return '';
    
    const width = 100;
    const height = 20;
    const barWidth = width / sortedData.length;
    
    return sortedData.map((point, index) => {
      const x = index * barWidth;
      const barHeight = (point.volume / volumeRange) * height;
      const y = height - barHeight;
      return `M ${x} ${height} L ${x} ${y} L ${x + barWidth * 0.8} ${y} L ${x + barWidth * 0.8} ${height} Z`;
    }).join(' ');
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get price change
  const firstPrice = sortedData[0]?.price || 0;
  const lastPrice = sortedData[sortedData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-900">Price History</h4>
          <p className="text-sm text-gray-600">
            {formatDate(sortedData[0]?.timestamp || 0)} - {formatDate(sortedData[sortedData.length - 1]?.timestamp || 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">${lastPrice.toFixed(3)}</p>
          <p className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(3)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="absolute inset-0"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Price line */}
          <path
            d={generatePricePath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Volume bars */}
          {showVolume && (
            <path
              d={generateVolumePath()}
              fill="#e5e7eb"
              opacity="0.6"
            />
          )}
          
          {/* Price points */}
          {sortedData.map((point, index) => {
            const x = (index / (sortedData.length - 1)) * 100;
            const y = 100 - ((point.price - minPrice) / priceRange) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
        
        {/* Price labels */}
        <div className="absolute left-0 top-0 text-xs text-gray-500">
          ${maxPrice.toFixed(3)}
        </div>
        <div className="absolute left-0 bottom-0 text-xs text-gray-500">
          ${minPrice.toFixed(3)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600">High</p>
          <p className="font-semibold text-green-600">${maxPrice.toFixed(3)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Low</p>
          <p className="font-semibold text-red-600">${minPrice.toFixed(3)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Avg</p>
          <p className="font-semibold">${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3)}</p>
        </div>
      </div>
    </div>
  );
} 