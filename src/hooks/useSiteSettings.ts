// FILE: src/hooks/useSiteSettings.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types';

const defaultSettings: SiteSettings = {
  brandName: 'Chef Bruno Hotel & Culinary Center',
  tagline: 'Excellence in Hospitality Management',
  location: 'Rwanda, West Province, Rubavu District',
  description: 'Chef Bruno Hotel & Culinary Center is a luxury destination where world-class gastronomy meets exceptional hospitality. We offer premium accommodations, professional culinary training, and an immersive sensory experience for food enthusiasts and travelers alike.',
  vision: 'To become a leading chef and hospitality brand in Rwanda and beyond, known for delivering high quality, creative, innovative and memorable hospitality experiences.',
  mission: 'To prepare delicious, safe, healthy and high quality meals, provide excellent customer services, train others in culinary and hospitality skills and continuously innovate in the food industry.',
  tiktokHandle: 'Shimirwa Bruno',
  instagramHandle: 'Shimirwa Bruno',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'siteSettings', 'main'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as SiteSettings);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching settings:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};
