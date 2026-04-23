// FILE: src/hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from '../types';
import { seedEvents } from '../data/seedData';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      
      setEvents(eventData.length > 0 ? eventData : seedEvents);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching events:', err);
      setError(err.message);
      setLoading(false);
      if (events.length === 0) setEvents(seedEvents);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading, error };
};
