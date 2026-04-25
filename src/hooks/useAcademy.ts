// FILE: src/hooks/useAcademy.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { AcademyModule } from '../types';

export const useAcademy = () => {
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'academy'), orderBy('moduleNumber', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AcademyModule[]);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching academy modules:', err);
      setError(err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { modules, loading, error };
};