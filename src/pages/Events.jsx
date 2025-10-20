import { useEffect, useState, useRef } from 'react';
import useEventStore from '../store/useEventStore';
import { djService } from '../api';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/format';
import { validateRequired, validateVenueName } from '../utils/validators';
import QRCode from 'qrcode';

const Events = () => {
  const { 
    activeEvent, 
    fetchActiveEvent, 
    startEvent, 
    stopEvent,
    loading 
  } = useEventStore();

  const [startEventForm, setStartEventForm] = useState({
    venue_name: '',
  });
  const [errors, setErrors] = useState({});
  const [qrLink, setQrLink] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    fetchActiveEvent();
    fetchQrLink();
  }, [fetchActiveEvent]);

  const fetchQrLink = async () => {
    setLoadingQr(true);
    try {
      const response = await djService.getQrLink();
      const qrUrl = response.url;
      setQrLink(qrUrl);
      
      // Generate QR code image
      if (qrCanvasRef.current && qrUrl) {
        try {
          await QRCode.toCanvas(qrCanvasRef.current, qrUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
          // Still show the URL link even if QR generation fails
        }
      }
    } catch (error) {
      console.error('Error fetching QR link:', error);
      toast.error('Failed to load QR code');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStartEventForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(startEventForm.venue_name)) {
      newErrors.venue_name = 'Venue name is required';
    } else if (!validateVenueName(startEventForm.venue_name)) {
      newErrors.venue_name = 'Please enter a valid venue name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEvent = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await startEvent(startEventForm);
      toast.success('Event started successfully!');
      setStartEventForm({ venue_name: '' });
    } catch (error) {
      console.error('Error starting event:', error);
      toast.error('Failed to start event');
    }
  };

  const handleStopEvent = async () => {
    if (!activeEvent) return;

    try {
      await stopEvent(activeEvent.id);
      toast.success('Event stopped successfully!');
    } catch (error) {
      console.error('Error stopping event:', error);
      toast.error('Failed to stop event');
    }
  };

  const copyQrLink = () => {
    navigator.clipboard.writeText(qrLink);
    toast.success('QR link copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <p className="mt-2 text-gray-600">
          Start and stop your DJ events, and manage your QR code link.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Event Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Current Event Status
            </h2>

            {activeEvent ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Event is LIVE
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Venue:</p>
                    <p className="text-sm text-gray-900">{activeEvent.venue_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Started:</p>
                    <p className="text-sm text-gray-900">{formatDateTime(activeEvent.started_at)}</p>
                  </div>
                </div>

                <button
                  onClick={handleStopEvent}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Stop Event'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      No active event
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStartEvent} className="space-y-4">
                  <div>
                    <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      id="venue_name"
                      name="venue_name"
                      value={startEventForm.venue_name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.venue_name ? 'border-red-300' : ''
                      }`}
                      placeholder="e.g., The Blue Note"
                    />
                    {errors.venue_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.venue_name}</p>
                    )}
                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Start Event'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Link */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your QR Code Link
            </h2>

            {loadingQr ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading QR link...</p>
              </div>
            ) : qrLink ? (
              <div className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <canvas 
                      ref={qrCanvasRef}
                      className="block"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Scan with phone camera
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your permanent request link:
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {qrLink}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={copyQrLink}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    📋 Copy Link
                  </button>
                  <a
                    href={qrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    👁️ Preview
                  </a>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">ℹ️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>How it works:</strong><br/>
                        • Share this QR code or link with your audience<br/>
                        • When you START an event, visitors can make song requests<br/>
                        • When NO event is active, they'll see a "not performing" message
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Unable to load QR link</p>
                <button
                  onClick={fetchQrLink}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
