import Link from "next/link";

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 10h12M12 5l5 5-5 5" />
    </svg>
  );
}

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-20 md:my-28">
      <div className="h-px w-16 bg-[#2d2b25]/15" />
      <div className="w-2 h-2 rotate-45 border border-[#2d2b25]/25" />
      <div className="h-px w-16 bg-[#2d2b25]/15" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf1e1] text-[#2d2b25] overflow-x-hidden">
      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#faf1e1]/80 border-b border-[#2d2b25]/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-['Playfair_Display',serif] text-lg tracking-tight"
          >
            I Think She Wifey
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[#2d2b25]/60 hover:text-[#2d2b25] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[#2d2b25]/60 hover:text-[#2d2b25] transition-colors"
            >
              Features
            </a>
            <Link
              href="/demo"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[#2d2b25]/60 hover:text-[#2d2b25] transition-colors"
            >
              Demo
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[#2d2b25]/60 hover:text-[#2d2b25] transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase border border-[#2d2b25] px-5 py-2 hover:bg-[#2d2b25] hover:text-[#faf1e1] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background texture — subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center min-h-[calc(100vh-4rem)]">
            {/* Left — Copy */}
            <div className="flex flex-col justify-center py-16 lg:py-0">
              <p
                className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[#2d2b25]/50 mb-6 animate-[fadeUp_0.8s_ease_0.1s_both]"
              >
                Wedding Website Builder
              </p>

              <h1 className="font-['Playfair_Display',serif] leading-[0.95] tracking-[-0.02em] mb-8">
                <span className="block text-[clamp(2.8rem,7vw,5.5rem)] animate-[fadeUp_0.8s_ease_0.2s_both]">
                  Design in Canva.
                </span>
                <span className="block text-[clamp(2.8rem,7vw,5.5rem)] animate-[fadeUp_0.8s_ease_0.35s_both]">
                  Launch your
                </span>
                <span className="block text-[clamp(2.8rem,7vw,5.5rem)] italic font-light text-[#b5a992] animate-[fadeUp_0.8s_ease_0.5s_both]">
                  wedding website.
                </span>
              </h1>

              <p className="font-['DM_Sans',sans-serif] text-base md:text-lg text-[#2d2b25]/60 max-w-md leading-relaxed mb-10 animate-[fadeUp_0.8s_ease_0.6s_both]">
                Import your Canva designs and turn them into beautiful,
                interactive wedding websites — with RSVP, gallery, and
                everything your guests need.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-[fadeUp_0.8s_ease_0.7s_both]">
                <Link 
                  href="/signup"
                  className="group relative inline-flex items-center gap-3 bg-[#2d2b25] text-[#faf1e1] px-8 py-4 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#1a1812] transition-colors duration-300"
                >
                  Import Your Canva Design
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 font-['DM_Sans',sans-serif] text-[13px] font-medium tracking-[0.08em] uppercase text-[#2d2b25]/60 hover:text-[#2d2b25] transition-colors px-2 py-4"
                >
                  See a Live Demo
                  <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right — Hero visual: overlapping photo composition */}
            <div className="relative flex justify-center lg:justify-end py-8 lg:py-0 animate-[fadeUp_1s_ease_0.5s_both]">
              <div className="relative w-full max-w-lg">
                {/* Background decorative frame */}
                <div className="absolute -top-6 -right-6 w-full h-full border border-[#cdc1ab]/40" />

                {/* Main image */}
                <div className="relative aspect-[3/4] w-full max-w-[380px] ml-auto overflow-hidden">
                  <img
                    src="/demo/images/photo-1.jpg"
                    alt="Wedding couple"
                    className="w-full h-full object-cover filter sepia-[0.05]"
                  />
                  {/* Overlay label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d2b25]/70 to-transparent p-6 pt-16">
                    <p className="font-['Playfair_Display',serif] text-[#faf1e1] text-xl italic">
                      Kifle & Milka
                    </p>
                    <p className="font-['DM_Sans',sans-serif] text-[#faf1e1]/70 text-xs tracking-[0.15em] uppercase mt-1">
                      August 2026 &bull; Winnipeg
                    </p>
                  </div>
                </div>

                {/* Floating secondary image */}
                <div className="absolute -bottom-10 -left-8 w-40 h-48 overflow-hidden shadow-2xl hidden md:block">
                  <img
                    src="/demo/images/photo-2.jpg"
                    alt="Couple detail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[fadeUp_0.8s_ease_1.2s_both]">
          <span className="font-['DM_Sans',sans-serif] text-[10px] tracking-[0.3em] uppercase text-[#2d2b25]/30">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[#2d2b25]/30 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ============ SOCIAL PROOF LINE ============ */}
      <div className="border-y border-[#2d2b25]/[0.06] py-6 bg-[#cdc1ab]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap justify-center gap-x-12 gap-y-3">
          {[
            "Beautiful templates",
            "Canva integration",
            "Built-in RSVP",
            "Mobile responsive",
            "Custom domains",
          ].map((item) => (
            <span
              key={item}
              className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.25em] uppercase text-[#2d2b25]/35"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Section header */}
          <div className="text-center mb-20 md:mb-28">
            <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[#2d2b25]/40 mb-4">
              How It Works
            </p>
            <h2 className="font-['Playfair_Display',serif] text-[clamp(2rem,4.5vw,3.5rem)] leading-tight tracking-tight">
              From Canva to live website
              <br />
              <span className="italic font-light text-[#b5a992]">
                in three steps
              </span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {[
              {
                num: "01",
                title: "Design in Canva",
                desc: "Use Canva's free tools to design your dream wedding invite or website — just like you already do. Choose any template, customize colors, fonts, and photos.",
                accent: "bg-[#cdc1ab]/20",
              },
              {
                num: "02",
                title: "Import & Customize",
                desc: "Connect your Canva account, select your design, and map pages to website sections. Add your wedding details, guest list, and RSVP form.",
                accent: "bg-[#2d2b25]/[0.04]",
              },
              {
                num: "03",
                title: "Share Your Site",
                desc: "Your wedding website is live with a shareable link. Guests can RSVP, view the schedule, find venues, and explore your gallery — all from your Canva design.",
                accent: "bg-[#cdc1ab]/15",
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`group relative p-8 md:p-10 ${step.accent} hover:bg-[#2d2b25] transition-colors duration-500 cursor-default`}
              >
                <span className="font-['Playfair_Display',serif] text-6xl md:text-7xl font-light text-[#2d2b25]/[0.08] group-hover:text-[#faf1e1]/[0.08] transition-colors duration-500 absolute top-4 right-6">
                  {step.num}
                </span>
                <div className="relative">
                  <div className="w-10 h-px bg-[#2d2b25]/20 group-hover:bg-[#faf1e1]/20 mb-8 transition-colors duration-500" />
                  <h3 className="font-['Playfair_Display',serif] text-xl md:text-2xl mb-4 group-hover:text-[#faf1e1] transition-colors duration-500">
                    {step.title}
                  </h3>
                  <p className="font-['DM_Sans',sans-serif] text-sm leading-relaxed text-[#2d2b25]/60 group-hover:text-[#faf1e1]/60 transition-colors duration-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DiamondDivider />

      {/* ============ FEATURES ============ */}
      <section id="features" className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Feature visual */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Stacked card composition */}
                <div className="relative bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                  <img
                    src="/demo/images/photo-4.jpg"
                    alt="Wedding website preview"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                {/* Floating RSVP card mockup */}
                <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] w-52">
                  <p className="font-['DM_Sans',sans-serif] text-[10px] font-semibold tracking-[0.2em] uppercase text-[#2d2b25]/40 mb-3">
                    RSVP Response
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600/70" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[#2d2b25]/70">
                        Attending — 42
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#cdc1ab]" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[#2d2b25]/70">
                        Pending — 18
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[#2d2b25]/70">
                        Declined — 4
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Feature list */}
            <div className="order-1 lg:order-2">
              <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[#2d2b25]/40 mb-4">
                Features
              </p>
              <h2 className="font-['Playfair_Display',serif] text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-12">
                Everything you need,
                <br />
                <span className="italic font-light text-[#b5a992]">
                  nothing you don&apos;t
                </span>
              </h2>

              <div className="space-y-8">
                {[
                  {
                    title: "Built-in RSVP",
                    desc: "Guests RSVP directly on your site. Track responses, meal choices, and plus-ones from your dashboard.",
                  },
                  {
                    title: "Beautiful Templates",
                    desc: "Start with a curated template or import your own Canva design. Every site is mobile-responsive and fast.",
                  },
                  {
                    title: "Custom Domains",
                    desc: "Share a memorable link like yournames.ithinkshewifey.com — or connect your own custom domain.",
                  },
                  {
                    title: "Guest Management",
                    desc: "Import your guest list, send access codes, and manage RSVPs for multiple events — ceremony, reception, brunch.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group flex gap-5 items-start"
                  >
                    <div className="mt-2 w-2 h-2 rotate-45 border border-[#cdc1ab] group-hover:bg-[#cdc1ab] transition-colors duration-300 shrink-0" />
                    <div>
                      <h3 className="font-['Playfair_Display',serif] text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="font-['DM_Sans',sans-serif] text-sm text-[#2d2b25]/55 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DiamondDivider />

      {/* ============ DEMO SHOWCASE ============ */}
      <section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[#2d2b25]/40 mb-4">
              Live Example
            </p>
            <h2 className="font-['Playfair_Display',serif] text-[clamp(2rem,4.5vw,3.5rem)] leading-tight tracking-tight">
              See it in action
            </h2>
            <p className="font-['DM_Sans',sans-serif] text-sm text-[#2d2b25]/50 mt-4 max-w-md mx-auto leading-relaxed">
              This is a real wedding website built on the platform — the
              wedding of Kifle & Milka, our very first couple.
            </p>
          </div>

          {/* Browser mockup */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#2d2b25] rounded-t-lg p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#faf1e1]/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#faf1e1]/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#faf1e1]/15" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-[#faf1e1]/10 rounded-sm px-3 py-1 text-center">
                  <span className="font-['DM_Sans',sans-serif] text-[11px] text-[#faf1e1]/40">
                    ithinkshewifey.com/demo
                  </span>
                </div>
              </div>
            </div>
            <Link href="/demo" className="block group relative">
              <div className="relative overflow-hidden border border-t-0 border-[#2d2b25]/10">
                <img
                  src="/demo/images/photo-1.jpg"
                  alt="Jane & John wedding website demo"
                  className="w-full aspect-[16/9] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#2d2b25]/0 group-hover:bg-[#2d2b25]/40 transition-colors duration-500 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.15em] uppercase text-[#faf1e1] border border-[#faf1e1]/50 px-8 py-3">
                    View Live Demo
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="bg-[#2d2b25] py-20 md:py-28 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#faf1e1]/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#faf1e1]/[0.04]" />

        <div className="relative max-w-3xl mx-auto px-6 md:px-10 text-center">
          <h2 className="font-['Playfair_Display',serif] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#faf1e1] mb-6">
            Your love story deserves
            <br />
            <span className="italic font-light text-[#cdc1ab]">
              more than a template
            </span>
          </h2>
          <p className="font-['DM_Sans',sans-serif] text-sm text-[#faf1e1]/50 max-w-md mx-auto mb-10 leading-relaxed">
            Start with the design you already love from Canva. We&apos;ll
            turn it into a wedding website your guests will actually enjoy
            using.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="group inline-flex items-center gap-3 bg-[#faf1e1] text-[#2d2b25] px-8 py-4 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#cdc1ab] transition-colors duration-300"
            >
              Get Started Free
              <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="font-['DM_Sans',sans-serif] text-[13px] font-medium tracking-[0.08em] uppercase text-[#faf1e1]/50 hover:text-[#faf1e1] transition-colors px-4 py-4"
            >
              See the Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#cdc1ab]/20 py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-['Playfair_Display',serif] text-lg">
                I Think She Wifey
              </p>
              <p className="font-['DM_Sans',sans-serif] text-[11px] text-[#2d2b25]/40 tracking-wide mt-1">
                Wedding websites, elevated.
              </p>
            </div>
            <div className="flex items-center gap-8">
              {[
                { label: "Demo", href: "/demo" },
                { label: "Contact", href: "mailto:abelghebz@gmail.com" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-['DM_Sans',sans-serif] text-[12px] tracking-[0.1em] uppercase text-[#2d2b25]/45 hover:text-[#2d2b25] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="h-px bg-[#2d2b25]/10 my-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-['DM_Sans',sans-serif] text-[11px] text-[#2d2b25]/30">
              &copy; 2026 I Think She Wifey. All rights reserved.
            </p>
            <p className="font-['DM_Sans',sans-serif] text-[11px] text-[#2d2b25]/25">
              Built by Abel Ghebrezadik
            </p>
          </div>
        </div>
      </footer>

      {/* Keyframe styles for animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
