// FILE: src/hooks/useRooms.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[]);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching rooms:', err);
      setError(err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
};