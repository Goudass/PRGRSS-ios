/**
 * Tło: lokalny plik `/bg/ambient.svg` (działa w Capacitorze offline).
 * Możesz nadpisać własnym zdjęciem: wrzuć `public/bg/ambient.jpg` i podmień `backgroundImage` poniżej na `url(/bg/ambient.jpg)`.
 */
const BG = "/bg/ambient.svg";

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#090C11]"
      aria-hidden
    >
      <div
        className="absolute inset-0 scale-[1.08] bg-cover bg-center opacity-[0.38] sm:opacity-[0.42]"
        style={{ backgroundImage: `url(${BG})` }}
      />
      {/* przyciemnienie jak „film” na zdjęciu */}
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090c11]/80 via-[#090c11]/70 to-[#090c11]/92" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,rgba(255,238,50,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_85%_90%,rgba(255,209,0,0.05),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,238,50,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,238,50,0.05) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_95%_at_50%_50%,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}
