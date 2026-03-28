import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiCalendar,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';

interface EmotionData {
  emotion: string;
  count: number;
  riskLevel: string;
  timestamp: Date;
}

const EmotionalDashboard: React.FC = () => {
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Simulated emotion history - in real app, this would come from backend
  useEffect(() => {
    const mockData: EmotionData[] = [
      {
        emotion: 'happy',
        count: 5,
        riskLevel: 'Low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 0),
      },
      {
        emotion: 'sad',
        count: 2,
        riskLevel: 'High',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        emotion: 'neutral',
        count: 3,
        riskLevel: 'Low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
      {
        emotion: 'angry',
        count: 1,
        riskLevel: 'Medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
    ];
    setEmotionHistory(mockData);
  }, []);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'neutral':
        return '😐';
      default:
        return '😶';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const emotionStats = emotionHistory.reduce(
    (acc, curr) => {
      const existing = acc.find((e) => e.emotion === curr.emotion);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ emotion: curr.emotion, count: 1 });
      }
      return acc;
    },
    [] as Array<{ emotion: string; count: number }>
  );

  const totalAnalyses = emotionHistory.length;
  const averageRisk =
    emotionHistory.length > 0
      ? (
          emotionHistory.filter((e) => e.riskLevel === 'High').length /
          emotionHistory.length
        ).toFixed(1)
      : '0';

  const dominantEmotion =
    emotionStats.length > 0
      ? emotionStats.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        ).emotion
      : 'N/A';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-secondary-600">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          📊 Emotional Insights Dashboard
        </h2>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Analyses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Analyses</p>
            <FiBarChart2 className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{totalAnalyses}</p>
          <p className="text-xs text-gray-500 mt-1">this {timeRange}</p>
        </div>

        {/* Dominant Emotion */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Dominant Emotion</p>
            <span className="text-2xl">{getEmotionIcon(dominantEmotion)}</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {dominantEmotion}
          </p>
        </div>

        {/* Average Risk */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">High Risk %</p>
            <FiAlertCircle className="text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{averageRisk}%</p>
          <p className="text-xs text-gray-500 mt-1">need attention</p>
        </div>

        {/* Positive Trend */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Positive Trend</p>
            <FiTrendingUp className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {emotionStats.filter((e) => e.emotion === 'happy').length > 0 ? '↗' : '→'}
          </p>
          <p className="text-xs text-gray-500 mt-1">keep smiling</p>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiBarChart2 className="mr-2" />
          Emotion Distribution
        </h3>
        <div className="space-y-3">
          {emotionStats.map((stat) => (
            <div key={stat.emotion}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {getEmotionIcon(stat.emotion)} {stat.emotion}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  {stat.count}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(stat.count / totalAnalyses) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiCalendar className="mr-2" />
          Recent Analysis History
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {emotionHistory.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg flex items-center justify-between ${getRiskColor(
                item.riskLevel
              )}`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getEmotionIcon(item.emotion)}</span>
                <div>
                  <p className="font-semibold capitalize">{item.emotion}</p>
                  <p className="text-xs opacity-75">
                    {item.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold capitalize">
                  {item.riskLevel}
                </span>
                {item.riskLevel === 'Low' ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiAlertCircle className="text-orange-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FiCheckCircle className="mr-2" />
          Recommendations
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Practice mindfulness and meditation for 10 minutes daily to improve mood
          </li>
          <li>• Maintain consistent sleep schedule for better emotional regulation</li>
          <li>• Engage in physical activity to boost positive emotions</li>
          <li>
            • Consider speaking with a mental health professional if high-risk
            emotions persist
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmotionalDashboard;
