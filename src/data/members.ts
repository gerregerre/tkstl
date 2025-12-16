import { User } from '@/types/user';

export const members: User[] = [
  // THE ROYALTY - Tennis Deities
  {
    id: 'gerard',
    name: 'Gerard',
    role: 'royalty',
    title: 'The Eternal Champion',
    bio: "Whispered to have been blessed by the Tennis Gods themselves at birth. His forehand was allegedly used as the template for all future forehands.",
    wins: 47,
    losses: 12,
    pointDifferential: 156,
    nobleStandard: 9.2,
    yearsOfService: 7,
    accomplishments: [
      'Inventor of the Forehand',
      'Supreme Ruler of the Baseline',
      'Lord of the Deuce Court',
      'Bearer of the Golden Racket',
    ],
  },
  {
    id: 'kockum',
    name: 'Kockum',
    role: 'royalty',
    title: 'The Founding Father',
    bio: "Legend speaks of a time before Kockum joined tennis. Historians agree it was a dark age. His serve has been classified as a weapon of mass destruction.",
    wins: 44,
    losses: 15,
    pointDifferential: 128,
    nobleStandard: 8.9,
    yearsOfService: 7,
    accomplishments: [
      'Architect of Victory',
      'Guardian of the Net',
      'Duke of Drop Shots',
      'Keeper of Sacred Tennis Balls',
    ],
  },
  {
    id: 'viktor',
    name: 'Viktor',
    role: 'royalty',
    title: 'The Strategist',
    bio: "Viktor sees seven moves ahead. Some say he once won a match purely through intimidating eye contact. His backhand slice defies the laws of physics.",
    wins: 41,
    losses: 18,
    pointDifferential: 98,
    nobleStandard: 8.7,
    yearsOfService: 7,
    accomplishments: [
      'Master of the Mental Game',
      'Earl of Elegant Volleys',
      'Sovereign of the Sauna',
      'Prophet of Perfect Placement',
    ],
  },
  // THE PEASANTS - Scum of the Earth
  {
    id: 'ludvig',
    name: 'Ludvig',
    role: 'peasant',
    title: 'Ball Boy Aspirant',
    bio: "Graciously permitted to exist on the same court as the Founders. Shows occasional promise, like a stray dog that learns a trick.",
    wins: 23,
    losses: 36,
    pointDifferential: -45,
    nobleStandard: 6.4,
    yearsOfService: 2,
    accomplishments: [
      'Ball Boy Potential',
      'Adequate at Fetching',
      'Once Hit It Over the Net',
      'Participation Award Recipient',
    ],
  },
  {
    id: 'joel',
    name: 'Joel',
    role: 'peasant',
    title: 'Court Sweeper Third Class',
    bio: "Joel was discovered wandering near the tennis courts looking lost. Out of pity, the Founders allowed him to hold a racket. Results have been... charitable.",
    wins: 19,
    losses: 40,
    pointDifferential: -67,
    nobleStandard: 5.8,
    yearsOfService: 1,
    accomplishments: [
      'Unworthy of the Clay',
      'Professional Court Warmer',
      'Expert at Losing Gracefully',
      'Shows Up Sometimes',
    ],
  },
  {
    id: 'hampus',
    name: 'Hampus',
    role: 'peasant',
    title: 'Equipment Carrier',
    bio: "The newest addition to our charity program. Hampus believes he plays tennis. We let him think that. His service motion has been compared to a windmill in a hurricane.",
    wins: 21,
    losses: 38,
    pointDifferential: -52,
    nobleStandard: 6.1,
    yearsOfService: 1,
    accomplishments: [
      'Knows What a Tennis Ball Is',
      'Can Identify a Racket',
      'Stood on Clay Once',
      'Enthusiastic Clapper',
    ],
  },
];

export const getMemberById = (id: string): User | undefined => {
  return members.find(m => m.id === id);
};

export const getRoyalty = (): User[] => {
  return members.filter(m => m.role === 'royalty');
};

export const getPeasants = (): User[] => {
  return members.filter(m => m.role === 'peasant');
};
