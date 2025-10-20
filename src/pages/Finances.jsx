import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../utils/money';
import { formatDate, formatDateTime } from '../utils/format';

const Finances = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancesOverview();
  }, []);

  const fetchFinancesOverview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get today's finances and overview
      const [todayResponse, overviewResponse] = await Promise.all([
        api.get('/api/djs/me/finances/today'),
        api.get('/api/djs/me/finances/overview')
      ]);
      
      setOverview({
        today: todayResponse.data,
        ...overviewResponse.data
      });
    } catch (error) {
      console.error('Error fetching finances overview:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">{error}</div>
          <button
            onClick={fetchFinancesOverview}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
        <p className="mt-2 text-gray-600">
          Track your earnings and view your event history.
        </p>
      </div>

      {/* Today's Summary */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overview?.today?.total_cents_today || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.today?.total_requests || 0}
              </p>
              <p className="text-sm text-gray-500">Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(overview?.today?.pending_cents || 0)}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {overview?.today?.completed_count || 0}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All-Time Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overview?.total_revenue_cents || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.events_count || 0}
              </p>
              <p className="text-sm text-gray-500">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.total_requests || 0}
              </p>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h2>
          
          {overview?.event_breakdown && overview.event_breakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.event_breakdown.map((event, index) => (
                    <tr key={event.event_id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.venue_name || `Event ${index + 1}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.event_date ? formatDate(event.event_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.total_requests || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(event.total_revenue_cents || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.acceptance_rate || '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">No events yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start your first event to see earnings data here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finances;
