export type Team = {
  name: string;
  code: string;
  flag: string;
  group: string;
  pot: number;
};

export type Participant = {
  name: string;
  emoji: string;
  /** tailwind gradient classes for the card accent */
  gradient: string;
  teams: Team[];
};

export const POT_LABELS: Record<number, string> = {
  1: "Lead Team",
  2: "Contender",
  3: "Solid",
  4: "Competitive",
  5: "Underdog",
  6: "Longshot",
};

export const POT_COLORS: Record<number, string> = {
  1: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  2: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  3: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  4: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  5: "bg-orange-400/15 text-orange-300 border-orange-400/30",
  6: "bg-rose-400/15 text-rose-300 border-rose-400/30",
};

export const GROUP_COLORS: Record<string, string> = {
  A: "bg-red-400/15 text-red-300 border-red-400/30",
  B: "bg-orange-400/15 text-orange-300 border-orange-400/30",
  C: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  D: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  E: "bg-lime-400/15 text-lime-300 border-lime-400/30",
  F: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  G: "bg-teal-400/15 text-teal-300 border-teal-400/30",
  H: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
  I: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  J: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",
  K: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  L: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
};

export const PARTICIPANTS: Participant[] = [
  {
    name: "diwa",
    emoji: "🏆",
    gradient: "from-amber-400 to-orange-500",
    teams: [
      { name: "France", code: "fr", flag: "🇫🇷", group: "I", pot: 1 },
      { name: "Germany", code: "de", flag: "🇩🇪", group: "E", pot: 1 },
      { name: "Algeria", code: "dz", flag: "🇩🇿", group: "J", pot: 4 },
      { name: "Colombia", code: "co", flag: "🇨🇴", group: "K", pot: 2 },
      { name: "Congo DR", code: "cd", flag: "🇨🇩", group: "K", pot: 6 },
      { name: "Ecuador", code: "ec", flag: "🇪🇨", group: "E", pot: 3 },
      { name: "Haiti", code: "ht", flag: "🇭🇹", group: "C", pot: 6 },
      { name: "Iraq", code: "iq", flag: "🇮🇶", group: "I", pot: 6 },
      { name: "Norway", code: "no", flag: "🇳🇴", group: "I", pot: 3 },
      { name: "Saudi Arabia", code: "sa", flag: "🇸🇦", group: "H", pot: 4 },
      { name: "Tunisia", code: "tn", flag: "🇹🇳", group: "F", pot: 5 },
      { name: "Türkiye", code: "tr", flag: "🇹🇷", group: "D", pot: 3 },
    ],
  },
  {
    name: "sid",
    emoji: "⭐",
    gradient: "from-sky-400 to-blue-600",
    teams: [
      { name: "England", code: "gb-eng", flag: "🏴", group: "L", pot: 1 },
      { name: "Spain", code: "es", flag: "🇪🇸", group: "H", pot: 1 },
      { name: "Bosnia and Herzegovina", code: "ba", flag: "🇧🇦", group: "B", pot: 5 },
      { name: "Croatia", code: "hr", flag: "🇭🇷", group: "L", pot: 2 },
      { name: "Ivory Coast", code: "ci", flag: "🇨🇮", group: "E", pot: 5 },
      { name: "Jordan", code: "jo", flag: "🇯🇴", group: "J", pot: 6 },
      { name: "New Zealand", code: "nz", flag: "🇳🇿", group: "G", pot: 6 },
      { name: "Paraguay", code: "py", flag: "🇵🇾", group: "D", pot: 4 },
      { name: "Qatar", code: "qa", flag: "🇶🇦", group: "B", pot: 5 },
      { name: "Scotland", code: "gb-sct", flag: "🏴", group: "C", pot: 4 },
      { name: "South Korea", code: "kr", flag: "🇰🇷", group: "A", pot: 3 },
      { name: "Sweden", code: "se", flag: "🇸🇪", group: "F", pot: 3 },
    ],
  },
  {
    name: "Suraj",
    emoji: "⭐",
    gradient: "from-yellow-400 to-emerald-500",
    teams: [
      { name: "Argentina", code: "ar", flag: "🇦🇷", group: "J", pot: 1 },
      { name: "Netherlands", code: "nl", flag: "🇳🇱", group: "F", pot: 1 },
      { name: "Australia", code: "au", flag: "🇦🇺", group: "D", pot: 4 },
      { name: "Cape Verde", code: "cv", flag: "🇨🇻", group: "H", pot: 6 },
      { name: "Curaçao", code: "cw", flag: "🇨🇼", group: "E", pot: 6 },
      { name: "Czechia", code: "cz", flag: "🇨🇿", group: "A", pot: 4 },
      { name: "Ghana", code: "gh", flag: "🇬🇭", group: "L", pot: 5 },
      { name: "Japan", code: "jp", flag: "🇯🇵", group: "F", pot: 2 },
      { name: "Mexico", code: "mx", flag: "🇲🇽", group: "A", pot: 2 },
      { name: "Panama", code: "pa", flag: "🇵🇦", group: "L", pot: 5 },
      { name: "Senegal", code: "sn", flag: "🇸🇳", group: "I", pot: 3 },
      { name: "Uruguay", code: "uy", flag: "🇺🇾", group: "H", pot: 2 },
    ],
  },
  {
    name: "tushar",
    emoji: "⭐",
    gradient: "from-fuchsia-500 to-purple-600",
    teams: [
      { name: "Brazil", code: "br", flag: "🇧🇷", group: "C", pot: 1 },
      { name: "Portugal", code: "pt", flag: "🇵🇹", group: "K", pot: 1 },
      { name: "Austria", code: "at", flag: "🇦🇹", group: "J", pot: 3 },
      { name: "Belgium", code: "be", flag: "🇧🇪", group: "G", pot: 2 },
      { name: "Canada", code: "ca", flag: "🇨🇦", group: "B", pot: 4 },
      { name: "Egypt", code: "eg", flag: "🇪🇬", group: "G", pot: 5 },
      { name: "Iran", code: "ir", flag: "🇮🇷", group: "G", pot: 4 },
      { name: "Morocco", code: "ma", flag: "🇲🇦", group: "C", pot: 3 },
      { name: "South Africa", code: "za", flag: "🇿🇦", group: "A", pot: 5 },
      { name: "Switzerland", code: "ch", flag: "🇨🇭", group: "B", pot: 2 },
      { name: "United States", code: "us", flag: "🇺🇸", group: "D", pot: 2 },
      { name: "Uzbekistan", code: "uz", flag: "🇺🇿", group: "K", pot: 6 },
    ],
  },
];

export const GROUPS = "ABCDEFGHIJKL".split("");
