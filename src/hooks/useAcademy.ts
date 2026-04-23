// FILE: src/hooks/useAcademy.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { AcademyModule } from '../types';
import { seedModules } from '../data/seedData';

export const useAcademy = () => {
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'academy'), orderBy('moduleNumber', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moduleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AcademyModule[];
      
      setModules(moduleData.length > 0 ? moduleData : seedModules);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching academy modules:', err);
      setError(err.message);
      setLoading(false);
      if (modules.length === 0) setModules(seedModules);
    });

    return () => unsubscribe();
  }, []);

  return { modules, loading, error };
};
