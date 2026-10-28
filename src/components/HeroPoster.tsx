import { MomoSvg } from './MomoFallback';

/**
 * Static illustration of the open CAFE 93 bucket, used only when WebGL is
 * unavailable. The live 3D scene replaces it everywhere else.
 */
export default function HeroPoster() {
  return (
    <div className="relative flex h-full w-full items-end justify-center pb-[6%]" role="img" aria-label="The CAFE 93 momo bucket, open and overflowing with momos">
      <div className="relative w-[min(70%,420px)]">
        <div className="absolute -top-[46%] left-1/2 flex w-[120%] -translate-x-1/2 justify-center gap-[2%]">
          <MomoSvg className="w-[30%] -rotate-12 translate-y-[30%]" />
          <MomoSvg className="w-[36%]" />
          <MomoSvg variant="tandoori" className="w-[30%] rotate-12 translate-y-[30%]" />
        </div>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="wisp absolute top-[-30%] h-24 w-10 rounded-full bg-white/20 blur-xl"
            style={{ left: `${30 + i * 18}%`, animationDelay: `${i * 0.9}s` }}
            aria-hidden
          />
        ))}
        <svg viewBox="0 0 300 300" className="relative w-full drop-shadow-[0_40px_40px_rgba(0,0,0,.6)]" aria-hidden>
          <path d="M20 30 L280 30 L250 290 L50 290 Z" fill="#F6F0E8" />
          <rect x="20" y="22" width="260" height="14" rx="7" fill="#F6F0E8" />
          <path d="M44 240 L256 240 L250 290 L50 290 Z" fill="#E53935" />
          <circle cx="150" cy="140" r="58" fill="#E53935" />
          <text x="150" y="162" textAnchor="middle" fontFamily="Space Grotesk, Arial Black, sans-serif" fontWeight="700" fontSize="62" fill="#FFF5E8">93</text>
          <text x="150" y="74" textAnchor="middle" fontFamily="Space Grotesk, Arial Black, sans-serif" fontWeight="700" fontSize="30" fill="#151515">CAFE</text>
        </svg>
      </div>
    </div>
  );
}
