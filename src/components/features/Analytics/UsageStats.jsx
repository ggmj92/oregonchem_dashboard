import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { API_URL } from '../../../utils/api';

const UsageStats = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchUsageStats();
  }, [days]);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You need to be logged in to view usage stats');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/ai-images/usage-stats?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data = await response.json();
      setStats(data.stats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (cost) => {
    return `$${(cost / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading usage statistics...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="usage-stats">
      <div className="stats-header">
        <h2>AI Image Generation Usage Statistics</h2>
        <div className="period-selector">
          <label>Period: </label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="no-data">No usage data available for the selected period.</div>
      ) : (
        <div className="stats-grid">
          {stats.map((endpoint, index) => (
            <div key={index} className="endpoint-card">
              <h3>{endpoint._id}</h3>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="label">Total Requests:</span>
                  <span className="value">{endpoint.totalRequests}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Cost:</span>
                  <span className="value cost">{formatCost(endpoint.totalCost)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Unique Users:</span>
                  <span className="value">{endpoint.uniqueUsers}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Avg Processing Time:</span>
                  <span className="value">{Math.round(endpoint.avgProcessingTime || 0)}ms</span>
                </div>
              </div>
              
              <div className="daily-breakdown">
                <h4>Daily Breakdown</h4>
                <div className="daily-stats">
                  {endpoint.dailyStats.map((day, dayIndex) => (
                    <div key={dayIndex} className="daily-item">
                      <span className="date">{formatDate(day.date)}</span>
                      <span className="requests">{day.requests} requests</span>
                      <span className="cost">{formatCost(day.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .usage-stats {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .stats-header h2 {
          margin: 0;
          color: #333;
        }

        .period-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .period-selector select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .endpoint-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .endpoint-card h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .stat-item .label {
          color: #666;
          font-weight: 500;
        }

        .stat-item .value {
          font-weight: bold;
          color: #333;
        }

        .stat-item .value.cost {
          color: #e74c3c;
        }

        .daily-breakdown h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        .daily-stats {
          max-height: 200px;
          overflow-y: auto;
        }

        .daily-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f5f5f5;
          font-size: 14px;
        }

        .daily-item .date {
          color: #666;
        }

        .daily-item .requests {
          color: #333;
        }

        .daily-item .cost {
          color: #e74c3c;
          font-weight: 500;
        }

        .loading, .error, .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

export default UsageStats;
