import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useEventStore from '../store/useEventStore';
import useRealtimeRequests from '../hooks/useRealtimeRequests';
import { formatCurrency } from '../utils/money';
import { formatRelativeTime, truncateText } from '../utils/format';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const Dashboard = () => {
  const { djProfile } = useAuthStore();
  const {
    pendingRequests,
    acceptedRequests,
    tonightTotals,
    fetchPendingRequests,
    fetchAcceptedRequests,
    fetchTonightTotals,
    acceptRequest,
    declineRequest,
    completeRequest,
  } = useEventStore();

  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [decliningRequestId, setDecliningRequestId] = useState(null);
  const [completingRequestId, setCompletingRequestId] = useState(null);
  const [etaInputs, setEtaInputs] = useState({});

  // Enable realtime updates
  useRealtimeRequests();

  // Fetch initial data
  useEffect(() => {
    if (djProfile?.id) {
      fetchPendingRequests();
      fetchAcceptedRequests();
      fetchTonightTotals();
    }
  }, [djProfile?.id, fetchPendingRequests, fetchAcceptedRequests, fetchTonightTotals]);

  const handleAcceptRequest = async (requestId) => {
    const etaMinutes = etaInputs[requestId] || 15;
    const eta = dayjs().add(etaMinutes, 'minutes').toISOString();

    setAcceptingRequestId(requestId);
    try {
      await acceptRequest(requestId, eta);
      toast.success('Request accepted!');
      setEtaInputs(prev => ({ ...prev, [requestId]: '' }));
    } catch (error) {
      toast.error('Failed to accept request');
      console.error('Error accepting request:', error);
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId, reason = '') => {
    setDecliningRequestId(requestId);
    try {
      await declineRequest(requestId, reason);
      toast.success('Request declined');
    } catch (error) {
      toast.error('Failed to decline request');
      console.error('Error declining request:', error);
    } finally {
      setDecliningRequestId(null);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    setCompletingRequestId(requestId);
    try {
      await completeRequest(requestId);
      toast.success('Request completed!');
    } catch (error) {
      toast.error('Failed to complete request');
      console.error('Error completing request:', error);
    } finally {
      setCompletingRequestId(null);
    }
  };

  const handleEtaChange = (requestId, minutes) => {
    setEtaInputs(prev => ({ ...prev, [requestId]: minutes }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {djProfile?.display_name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your requests tonight.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Pending Requests ({pendingRequests.length})
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  New
                </span>
              </div>

              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎵</div>
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {request.song_title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatCurrency(request.total_cents)}
                            {' • '}{formatRelativeTime(request.created_at)}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.tier}
                        </span>
                      </div>

                      {request.greeting && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message:</span> {truncateText(request.greeting, 100)}
                          </p>
                        </div>
                      )}

                      {request.has_image && (
                        <div className="mb-3">
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">📷 Image</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">ETA:</label>
                          <select
                            value={etaInputs[request.id] || 15}
                            onChange={(e) => handleEtaChange(request.id, parseInt(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={5}>5 min</option>
                            <option value={10}>10 min</option>
                            <option value={15}>15 min</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={acceptingRequestId === request.id}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {acceptingRequestId === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              'Accept'
                            )}
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={decliningRequestId === request.id}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            {decliningRequestId === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
                            ) : (
                              'Decline'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Accepted Queue */}
          <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Accepted Queue ({acceptedRequests.length})
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  In Progress
                </span>
              </div>

              <div className="space-y-4">
                {acceptedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">⏳</div>
                    <p className="text-gray-500">No accepted requests</p>
                  </div>
                ) : (
                  acceptedRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {request.song_title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            ETA: {formatRelativeTime(request.eta)} • {formatCurrency(request.total_cents)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompleteRequest(request.id)}
                          disabled={completingRequestId === request.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {completingRequestId === request.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            'Mark Complete'
                          )}
                        </button>
                      </div>

                      {request.greeting && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Message:</span> {truncateText(request.greeting, 100)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tonight's Revenue */}
        <div className="lg:col-span-1">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tonight's Revenue
              </h2>

              {tonightTotals ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(tonightTotals.total_cents_today || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total earned</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {tonightTotals.total_requests || 0}
                      </p>
                      <p className="text-xs text-gray-500">Requests</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {tonightTotals.completed_count || 0}
                      </p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Pending:</span>{' '}
                      {formatCurrency(tonightTotals.pending_cents || 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
