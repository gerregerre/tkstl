import { User } from "@/types/user";

export const members: User[] = [
  // THE ROYALTY - Tennis Deities
  {
    id: "gerard",
    name: "Gerard",
    role: "royalty",
    title: "Founding Father",
    bio: "Whispered to have been blessed by the Tennis Gods themselves at birth. His forehand was allegedly used as the template for all future forehands.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 7,
    accomplishments: [
      "Inventor of the Forehand",
      "Supreme Ruler of the Baseline",
      "Lord of the Deuce Court",
      "Bearer of the Golden Racket",
    ],
  },
  {
    id: "kockum",
    name: "Kockum",
    role: "royalty",
    title: "Founding Father",
    bio: "Legend speaks of a time before Kockum joined tennis. Historians agree it was a dark age. His serve has been classified as a weapon of mass destruction.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 7,
    accomplishments: [
      "Architect of Victory",
      "Guardian of the Net",
      "Duke of Drop Shots",
      "Keeper of Sacred Tennis Balls",
    ],
  },
  {
    id: "viktor",
    name: "Viktor",
    role: "royalty",
    title: "Founding Father",
    bio: "Viktor sees seven moves ahead. Some say he once won a match purely through intimidating eye contact. His backhand slice defies the laws of physics.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 7,
    accomplishments: [
      "Master of the Mental Game",
      "Earl of Elegant Volleys",
      "Sovereign of the Sauna",
      "Prophet of Perfect Placement",
    ],
  },
  // THE PEASANTS - Scum of the Earth, Tolerated Oxygen Thieves
  {
    id: "ludvig",
    name: "Ludvig",
    role: "peasant",
    title: "Ball Boy Aspirant",
    bio: "Graciously permitted to contaminate the same court as the Founders. Shows occasional promise, like a stray dog that learns a trick before immediately forgetting it. The Founders debate weekly whether his continued membership is charity or cruelty yet they toss him scraps just to watch a commoner play at loyalty.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 2,
    accomplishments: [
      "Professional Disappointment",
      "Adequate at Fetching Balls",
      "Once Hit It Over the Net (Accidentally)",
      "Participation Trophy Collector",
      "Champion of Low Expectations",
    ],
  },
  {
    id: "joel",
    name: "Joel",
    role: "peasant",
    title: "Court Sweeper Third Class",
    bio: "Found emerging from a peat bog clutching a broken branch and a dream, Joel was mistaken for a particularly confused local vegetable. Out of a sense of extreme civic duty, the Founders handed him a racket to keep him from eating the clay. He remains the club's longest-running experiment in human domestication.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 1,
    accomplishments: [
      "Unworthy of the Sacred Clay",
      "Professional Court Warmer",
      "Allergic to buying tennis balls",
      "Shows Up Sometimes (Barely)",
      "Walking Cautionary Tale",
    ],
  },
  {
    id: "hampus",
    name: "Hampus",
    role: "peasant",
    title: "Equipment Mule",
    bio: "The newest addition to our charity program. Hampus genuinely believes he plays tennis. We let him think that—it seems cruel to correct him now. His service motion has been compared to a malfunctioning windmill having a seizure. Doctors are baffled he can tie his own shoes yet the Founders keep the stray around for the sheer comedy.",
    wins: 0,
    losses: 0,
    pointDifferential: 0,
    nobleStandard: 0,
    yearsOfService: 1,
    accomplishments: [
      "Knows What a Tennis Ball Is (Probably)",
      "Can Identify a Racket 60% of the Time",
      "Stood on Clay Once Without Falling",
      "Enthusiastic Clapper",
      "Living Proof Standards Have Dropped",
    ],
  },
];

export const getMemberById = (id: string): User | undefined => {
  return members.find((m) => m.id === id);
};

export const getRoyalty = (): User[] => {
  return members.filter((m) => m.role === "royalty");
};

export const getPeasants = (): User[] => {
  return members.filter((m) => m.role === "peasant");
};
