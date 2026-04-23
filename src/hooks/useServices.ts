// FILE: src/hooks/useServices.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import { seedServices } from '../data/seedData';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serviceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      
      setServices(serviceData.length > 0 ? serviceData : seedServices);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching services:', err);
      setError(err.message);
      setLoading(false);
      if (services.length === 0) setServices(seedServices);
    });

    return () => unsubscribe();
  }, []);

  return { services, loading, error };
};
