import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsService } from '../api';

const DjRouter = () => {
  const { djSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [djInfo, setDjInfo] = useState(null);
  const [error, setError] = useState(null);

  // Force immediate console log to verify component loads
  console.log('🔄 DjRouter component loaded, djSlug:', djSlug);
  console.log('🔄 Component mounted at:', new Date().toISOString());
  
  // Add error boundary logging
  if (!djSlug) {
    console.error('❌ No djSlug from useParams!');
  }
  
  if (!navigate) {
    console.error('❌ No navigate function!');
  }

  useEffect(() => {
    console.log('🚀 DjRouter useEffect triggered');
    checkActiveEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djSlug]);

  const checkActiveEvent = async () => {
    let willRedirect = false;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Checking active event for DJ slug:', djSlug);
      const response = await eventsService.getDjActiveEvent(djSlug);
      console.log('✅ API Response:', response);
      console.log('Event ID found:', response?.event?.id);
      console.log('Event status:', response?.event?.status);
      
      if (response?.event?.id) {
        // DJ has an active event, redirect to request form
        const eventId = response.event.id;
        console.log('🎵 Redirecting to event:', eventId);
        console.log('🔗 Redirect URL:', `/event/${eventId}/request`);
        
        willRedirect = true;
        // Add a small delay to see the redirect in logs
        setTimeout(() => {
          navigate(`/event/${eventId}/request`, { replace: true });
        }, 500);
      } else {
        // No active event, show not performing message
        console.log('⏸️ No active event, showing DJ info');
        setDjInfo(response);
      }
    } catch (error) {
      console.error('❌ Error checking active event:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.status === 404) {
        // This means DJ exists but no active event
        if (error.response?.data?.message?.includes('No active event')) {
          setDjInfo({
            dj: { display_name: djSlug.replace('dj-', '').replace(/-[a-f0-9]+$/, '') }
          });
        } else {
          setError(`DJ not found: ${error.response?.data?.message || 'Unknown error'}`);
        }
      } else {
        setError('Unable to check DJ status');
      }
    } finally {
      // Only set loading false if we're not redirecting
      if (!willRedirect) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking DJ status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DJ Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error === 'DJ not found' 
              ? 'The DJ you\'re looking for doesn\'t exist or may have changed their link.'
              : 'We\'re having trouble connecting right now. Please try again later.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // DJ exists but is not currently performing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">🎧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {djInfo?.dj?.display_name || 'DJ'}
        </h1>
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mb-2">
            No Active Event
          </span>
          <h2 className="text-xl text-gray-600">
            Not currently performing
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">
            This DJ isn't accepting requests right now. They may be:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">🎵</span>
              Between sets
            </li>
            <li className="flex items-center">
              <span className="mr-2">⏰</span>
              Preparing for their next event
            </li>
            <li className="flex items-center">
              <span className="mr-2">📱</span>
              Taking a break
            </li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>For the DJ:</strong> Start an event in your dashboard to begin accepting requests!
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Keep this link handy! When they start their next event, 
          you'll be able to make song requests here.
        </p>
      </div>
    </div>
  );
};

export default DjRouter;
