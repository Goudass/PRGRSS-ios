/**
 * Przyciemnione zdjęcia w tle (Unsplash — siłownia / trening).
 * Własne pliki: `public/bg/...` i podmiana URL-i poniżej.
 */
const PHOTO_A =
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1600&q=75";
const PHOTO_B =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=75";

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-[0.1] sm:opacity-[0.12]"
        style={{ backgroundImage: `url(${PHOTO_A})` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-[center_20%] opacity-[0.07] sm:opacity-[0.09]"
        style={{ backgroundImage: `url(${PHOTO_B})` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-15%,rgba(255,238,50,0.055),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090c11]/96 via-[#090c11]/93 to-[#090c11]/97" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090c11] via-[#090c11]/70 to-transparent" />
    </div>
  );
}
