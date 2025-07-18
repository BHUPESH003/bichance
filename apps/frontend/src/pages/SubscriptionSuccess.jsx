import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SubscriptionSuccess = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState('loading');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (sessionId) {
      const token = localStorage.getItem('access_token');
      fetch(`https://bichance-production-a30f.up.railway.app/api/v1/subscription/session-info?session_id=${sessionId}`, {
        headers: {
          'accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(res => res.json())
        .then(data => {
          setStatus(data.subscription.status);
          setInfo(data);
        })
        .catch(() => {
          setStatus('error');
        });
    }
  }, [sessionId]);
  console.log(status);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Subscription Status</h1>
      {status === 'loading' && <p className="text-blue-600">Loading payment status...</p>}
      {status === 'active' && <p className="text-green-700 font-semibold">Payment successful! Thank you.</p>}
      {status !== 'loading' && status !== 'active' && (
        <p className="text-red-600 font-semibold">Payment failed or not completed.</p>
      )}
      {info && info.subscription && (
        <div className="mt-4 text-sm text-gray-700">
          <div>Subscription ID: {info.subscription.id}</div>
          <div>Status: {info.subscription.status}</div>
          <div>Current Period End: {info.subscription.current_period_end ? new Date(info.subscription.current_period_end * 1000).toLocaleString() : ''}</div>
        </div>
      )}
      <a href="/dashboard" className="mt-6 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition">Go to Dashboard</a>
    </div>
  );
};

export default SubscriptionSuccess; 