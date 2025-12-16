import { User } from '@/types/user';

export const members: User[] = [
  // THE ROYALTY - Tennis Deities
  {
    id: 'gerard',
    name: 'Gerard',
    role: 'royalty',
    title: 'The Eternal Sovereign',
    bio: 'Descended from the clay courts of Mount Olympus, Gerard\'s forehand has been compared to a gentle summer breeze that destroys everything in its path. His serve is said to have been blessed by Björn Borg himself during a fever dream.',
    wins: 47,
    losses: 12,
    pointDifferential: 156,
    nobleStandard: 9.2,
  },
  {
    id: 'kockum',
    name: 'Kockum',
    role: 'royalty',
    title: 'The Grand Strategist',
    bio: 'Legend speaks of Kockum\'s backhand as a mathematical certainty—opponents do not lose to it, they are simply solved by it. His court vision is rumored to extend into the fourth dimension, where all tennis balls inevitably return to his racket.',
    wins: 44,
    losses: 15,
    pointDifferential: 128,
    nobleStandard: 8.9,
  },
  {
    id: 'viktor',
    name: 'Viktor',
    role: 'royalty',
    title: 'The Velvet Hammer',
    bio: 'Viktor plays tennis the way poets write sonnets—with devastating precision and an air of inevitable tragedy for his opponents. His drop shots have caused grown men to weep, and his volleys are whispered about in hushed, reverent tones.',
    wins: 41,
    losses: 18,
    pointDifferential: 98,
    nobleStandard: 8.7,
  },
  // THE PEASANTS - Lucky to Breathe the Same Air
  {
    id: 'ludvig',
    name: 'Ludvig',
    role: 'peasant',
    title: 'The Adequate',
    bio: 'Ludvig was once observed hitting the ball over the net consistently for three consecutive points. The Royalty graciously allowed this to continue, presumably out of pity. He is permitted to use the same entrance as the Founders on alternate Tuesdays.',
    wins: 23,
    losses: 36,
    pointDifferential: -45,
    nobleStandard: 6.4,
  },
  {
    id: 'joel',
    name: 'Joel',
    role: 'peasant',
    title: 'The Enduring',
    bio: 'Joel\'s greatest achievement is his continued membership in the Society, a testament to either his persistence or the Founders\' endless capacity for mercy. His forehand occasionally makes contact with the ball, which is celebrated quietly among the other Peasants.',
    wins: 19,
    losses: 40,
    pointDifferential: -67,
    nobleStandard: 5.8,
  },
  {
    id: 'hampus',
    name: 'Hampus',
    role: 'peasant',
    title: 'The Hopeful',
    bio: 'Hampus joined the Society believing tennis was "just a sport." He has since learned the error of this thinking through extensive defeats. The Founders have noted his "admirable spirit in the face of inevitable failure," which is framed on his locker.',
    wins: 21,
    losses: 38,
    pointDifferential: -52,
    nobleStandard: 6.1,
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
