import rolexLogo from '@/assets/sponsors/rolex-logo.png';
import bnpLogo from '@/assets/sponsors/bnp-paribas-logo.png';

const sponsors = [
  { name: 'Rolex', logo: rolexLogo },
  { name: 'BNP Paribas', logo: bnpLogo },
];

export function Sponsors() {
  return (
    <div className="bg-card/50 border border-border/50 rounded-md px-6 py-4">
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest shrink-0">
          Official Partners
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-8 md:gap-12">
          {sponsors.map((sponsor) => (
            <img
              key={sponsor.name}
              src={sponsor.logo}
              alt={sponsor.name}
              className="h-8 md:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
