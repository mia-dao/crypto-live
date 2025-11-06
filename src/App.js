import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto.id);
    }
  }, [selectedCrypto]);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h,7d'
      );
      const data = await response.json();
      setCryptoData(data);
      if (!selectedCrypto && data.length > 0) {
        setSelectedCrypto(data[0]);
      }
      
      const totalMarketCap = data.reduce((acc, coin) => acc + coin.market_cap, 0);
      const avgChange = data.reduce((acc, coin) => acc + coin.price_change_percentage_24h, 0) / data.length;
      setMarketStats({ totalMarketCap, avgChange });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (coinId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
      );
      const data = await response.json();
      const formattedData = data.prices.map(([timestamp, price]) => ({
        time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: price.toFixed(2),
        timestamp
      }));
      setHistoricalData(formattedData.filter((_, i) => i % 6 === 0));
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400" size={32} />
        </div>
      </div>
    );
  }

  const pieData = cryptoData.slice(0, 5).map(coin => ({
    name: coin.symbol.toUpperCase(),
    value: coin.market_cap
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CryptoVision
              </h1>
              <p className="text-gray-400 text-sm">Real-time cryptocurrency analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live</span>
          </div>
        </div>

        {/* Market Stats */}
        {marketStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Market Cap</p>
                  <p className="text-2xl font-bold">{formatMarketCap(marketStats.totalMarketCap)}</p>
                </div>
                <DollarSign className="text-purple-400" size={32} />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-pink-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">24h Average Change</p>
                  <p className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {marketStats.avgChange.toFixed(2)}%
                  </p>
                </div>
                {marketStats.avgChange >= 0 ? (
                  <TrendingUp className="text-green-400" size={32} />
                ) : (
                  <TrendingDown className="text-red-400" size={32} />
                )}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Assets</p>
                  <p className="text-2xl font-bold">{cryptoData.length}</p>
                </div>
                <Zap className="text-cyan-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {['overview', 'analytics', 'distribution'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Sparkles className="mr-2 text-purple-400" size={20} />
            Top Cryptocurrencies
          </h2>
          {cryptoData.map((crypto) => (
            <div
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto)}
              className={`bg-white/5 backdrop-blur-lg rounded-2xl p-4 border cursor-pointer transition-all hover:scale-[1.02] ${
                selectedCrypto?.id === crypto.id
                  ? 'border-purple-500 bg-white/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold">{crypto.name}</p>
                    <p className="text-sm text-gray-400">{crypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                {crypto.price_change_percentage_24h >= 0 ? (
                  <ArrowUpRight className="text-green-400" size={20} />
                ) : (
                  <ArrowDownRight className="text-red-400" size={20} />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{formatPrice(crypto.current_price)}</p>
                  <p className="text-xs text-gray-400">MCap: {formatMarketCap(crypto.market_cap)}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  crypto.price_change_percentage_24h >= 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && selectedCrypto && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCrypto.name}</h2>
                    <p className="text-gray-400">{selectedCrypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{formatPrice(selectedCrypto.current_price)}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedCrypto.price_change_percentage_24h >= 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    24h: {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                  {selectedCrypto.price_change_percentage_7d_in_currency && (
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      selectedCrypto.price_change_percentage_7d_in_currency >= 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      7d: {selectedCrypto.price_change_percentage_7d_in_currency >= 0 ? '+' : ''}
                      {selectedCrypto.price_change_percentage_7d_in_currency.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {historicalData.length > 0 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="time" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #8B5CF6',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && selectedCrypto && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Market Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                    <p className="text-xl font-bold">{formatMarketCap(selectedCrypto.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                    <p className="text-xl font-bold">{formatMarketCap(selectedCrypto.total_volume)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Market Cap Rank</p>
                    <p className="text-xl font-bold">#{selectedCrypto.market_cap_rank}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Circulating Supply</p>
                    <p className="text-xl font-bold">{(selectedCrypto.circulating_supply / 1e6).toFixed(2)}M</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Price Range (24h)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Low</span>
                      <span className="text-gray-400">High</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{
                          width: `${((selectedCrypto.current_price - selectedCrypto.low_24h) / (selectedCrypto.high_24h - selectedCrypto.low_24h)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="font-medium">{formatPrice(selectedCrypto.low_24h)}</span>
                      <span className="font-medium">{formatPrice(selectedCrypto.high_24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Market Cap Distribution</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #8B5CF6',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={(value) => formatMarketCap(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-400 text-sm">
        <p>Data provided by CoinGecko API • Updates every 60 seconds</p>
      </div>
    </div>
  );
};

export default CryptoTracker;