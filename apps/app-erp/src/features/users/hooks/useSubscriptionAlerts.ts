import { useState, useEffect } from 'react';

interface SubscriptionAlert {
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

export const useSubscriptionAlerts = () => {
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/subscriptions/alerts', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching subscription alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const dismissAlert = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    alerts,
    loading,
    dismissAlert,
    refetch: fetchAlerts,
  };
};
