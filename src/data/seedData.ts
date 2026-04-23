// FILE: src/data/seedData.ts
import { AcademyModule, Room, Service, Event } from '../types';

export const seedRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Culinary Suite',
    price: 250,
    description: 'A spacious suite featuring a mini-professional kitchenette for food enthusiasts.',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'room-2',
    name: 'Gourmet Deluxe',
    price: 180,
    description: 'Elegant design meets comfort, perfect for travelers looking for a premium stay.',
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'room-3',
    name: "Chef's Studio",
    price: 120,
    description: 'Minimalist and functional, designed for students and solo culinary explorers.',
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&q=80&w=1000'
  }
];

export const seedModules: AcademyModule[] = [
  {
    id: 'module-1',
    moduleNumber: 1,
    title: 'Foundations',
    lessons: ['Culinary Mindset', 'Setting Up Your Professional Kitchen', 'Knife Skills and Safety'],
    outcome: 'A clear roadmap for your culinary journey',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'module-2',
    moduleNumber: 2,
    title: 'Flavor Profiling',
    lessons: ['The Science of Taste', 'Spice Blending', 'Sauce Mastery'],
    outcome: 'The ability to produce high-quality, balanced flavors',
    imageUrl: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'module-3',
    moduleNumber: 3,
    title: 'Modern Techniques',
    lessons: ['Sous Vide and Precision Cooking', 'Molecular Gastronomy Basics', 'Modern Plating'],
    outcome: 'A professional culinary toolkit for the modern age',
    imageUrl: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'module-4',
    moduleNumber: 4,
    title: 'Advanced Growth',
    lessons: ['Menu Engineering', 'Kitchen Management', 'Food Photography and Media'],
    outcome: 'Systems for scaling your culinary reach and operations',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'module-5',
    moduleNumber: 5,
    title: 'Culinary Business',
    lessons: ['Restaurant Concept Development', 'Food Costing and Profitability', 'Brand Distribution'],
    outcome: 'A sustainable business model for your culinary platform',
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000'
  }
];

export const seedServices: Service[] = [
  {
    id: 'service-1',
    title: 'Gourmet Catering',
    category: 'Catering',
    description: 'Exquisite multi-course meals tailored for your weddings, corporate events, or private gatherings.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'service-2',
    title: 'Personalized Nutrition Coaching',
    category: 'Nutrition',
    description: 'Work with our experts to develop a meal plan that supports your health and lifestyle goals.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'service-3',
    title: 'Private Culinary Tutorial',
    category: 'Tutorial',
    description: 'One-on-one sessions with Chef Bruno to master specific dishes or techniques in the comfort of your home.',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000'
  }
];

export const seedEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Rwandan Flavors Gala',
    date: '2024-08-15',
    category: 'Culinary',
    description: 'A night celebrating local ingredients through modern culinary techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'event-2',
    title: 'Hospitality Leadership Summit',
    date: '2024-09-20',
    category: 'Hospitality',
    description: 'Connecting professionals to share insights on the future of luxury hospitality in Africa.',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000'
  }
];
