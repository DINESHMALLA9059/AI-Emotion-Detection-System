import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

interface EmotionResult {
  emotion: string;
  confidence: number;
  risk_level?: string;
  source?: string;
}

interface ResultCardProps {
  result: EmotionResult | any;
  title?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, title = 'Analysis Result' }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <div className="flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" />
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-red-700">{result.error}</p>
            {result.details && <p className="text-red-600 text-sm mt-1">{result.details}</p>}
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (level?: string) => {
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

  const getEmotionColor = (emotion?: string) => {
    const e = emotion?.toLowerCase();
    if (e?.includes('happy')) return 'text-yellow-600 bg-yellow-50';
    if (e?.includes('sad')) return 'text-blue-600 bg-blue-50';
    if (e?.includes('angry')) return 'text-red-600 bg-red-50';
    if (e?.includes('joy')) return 'text-yellow-600 bg-yellow-50';
    return 'text-purple-600 bg-purple-50';
  };

  return (
    <div className="mt-6 animate-slideUp">
      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

        {/* Emotion Display */}
        {result.emotion && (
          <div className={`${getEmotionColor(result.emotion)} p-4 rounded-lg mb-4`}>
            <p className="text-sm font-medium text-gray-600 mb-1">Detected Emotion</p>
            <p className="text-2xl font-bold capitalize">{result.emotion}</p>
          </div>
        )}

        {/* Confidence and Risk in Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {result.confidence !== undefined && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Confidence</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>
          )}

          {result.risk_level && (
            <div className={`${getRiskColor(result.risk_level)} p-4 rounded-lg`}>
              <p className="text-sm font-medium text-gray-600 mb-1">Risk Level</p>
              <p className="text-2xl font-bold capitalize">{result.risk_level}</p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold risk-badge ${result.risk_level?.toLowerCase()}`}>
                  {result.risk_level}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Source Badge (if available) */}
        {result.source && (
          <div className="flex items-center justify-end">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
              {result.source} Analysis
            </span>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {result.risk_level && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <FiCheckCircle className="text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                {result.risk_level === 'High'
                  ? 'Important: Please Seek Support'
                  : result.risk_level === 'Medium'
                  ? 'Consider Professional Support'
                  : 'Keep Up Good Habits'}
              </h4>
              <p className="text-blue-800 text-sm">
                {result.risk_level === 'High'
                  ? 'Mental health support is important. Please reach out to a professional or crisis helpline.'
                  : result.risk_level === 'Medium'
                  ? 'Consider speaking with a counselor or mental health professional.'
                  : 'Continue maintaining healthy lifestyle habits and self-care practices.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
