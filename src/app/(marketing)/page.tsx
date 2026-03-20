import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import ScrollReveal from "@/components/ScrollReveal";
import MobileNav from "@/components/MobileNav";
import ThemeProvider from "@/components/dashboard/ThemeProvider";
import ThemeToggle from "@/components/dashboard/ThemeToggle";

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
      <div className="h-px w-16 bg-[var(--dash-text)]/15" />
      <div className="w-2 h-2 rotate-45 border border-[var(--dash-text)]/25" />
      <div className="h-px w-16 bg-[var(--dash-text)]/15" />
    </div>
  );
}

function FlourishDivider() {
  return (
    <div className="flex items-center justify-center my-16">
      <svg
        width="120"
        height="24"
        viewBox="0 0 120 24"
        fill="none"
        className="text-[var(--dash-text)]/40/50"
      >
        <path
          d="M0 12h40c4 0 6-4 8-8s4-4 8 0 4 8 8 8 6-4 8-8 4-4 8 0h40"
          stroke="currentColor"
          strokeWidth="0.75"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)] overflow-x-hidden">
      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--dash-bg)]/80 border-b border-[var(--dash-text)]/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--dash-text)] text-xl font-bold italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ITSW
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/demo"
              className="text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors"
            >
              Demo
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden md:inline-block text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="hidden md:inline-block text-[13px] font-['DM_Sans',sans-serif] font-medium tracking-[0.08em] uppercase border border-[var(--dash-text)] px-5 py-2 hover:bg-[var(--dash-text)] hover:text-[var(--dash-bg)] transition-all duration-300"
            >
              Get Started
            </Link>
            <MobileNav />
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

        {/* Gradient mesh — warm atmosphere (light mode only) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, rgba(205, 193, 171, 0.3) 0%, transparent 70%),
              radial-gradient(ellipse 60% 80% at 80% 60%, rgba(181, 169, 146, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 50% 50% at 50% 20%, rgba(250, 241, 225, 0.4) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center min-h-[calc(100vh-4rem)]">
            {/* Left — Copy */}
            <div className="flex flex-col justify-center py-16 lg:py-0">
              <p className="font-['Caveat',cursive] text-lg text-[var(--dash-text)]/50 mb-4 animate-[fadeUp_0.8s_ease_0.1s_both]">
                Where your forever begins online
              </p>

              <h1 className="font-['Cormorant_Garamond',serif] leading-[0.92] tracking-[-0.02em] mb-8">
                <span className="block text-[clamp(3rem,7.5vw,6rem)] font-light animate-[fadeUp_0.8s_ease_0.2s_both]">
                  Create your
                </span>
                <span className="block text-[clamp(3rem,7.5vw,6rem)] font-medium animate-[fadeUp_0.8s_ease_0.35s_both]">
                  wedding website
                </span>
                <span className="block text-[clamp(3rem,7.5vw,6rem)] italic font-light text-[var(--dash-text)]/50 animate-[fadeUp_0.8s_ease_0.5s_both]">
                  in minutes.
                </span>
              </h1>

              <p className="font-['DM_Sans',sans-serif] text-base md:text-lg text-[var(--dash-text)]/55 max-w-md leading-relaxed mb-10 animate-[fadeUp_0.8s_ease_0.6s_both]">
                Fully customisable, beautifully designed, and ready to share.
                RSVP tracking, gallery, schedule, gifts — everything your
                guests need, built in.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-[fadeUp_0.8s_ease_0.7s_both]">
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center gap-3 bg-[var(--dash-btn-bg)] text-[var(--dash-btn-text)] px-8 py-4 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase hover:opacity-90 transition-colors duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Start Building Free</span>
                  <ArrowIcon className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  {/* Shimmer on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out]" style={{ backgroundSize: "200% 100%" }} />
                </Link>
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 font-['DM_Sans',sans-serif] text-[13px] font-medium tracking-[0.08em] uppercase text-[var(--dash-text)]/60 hover:text-[var(--dash-text)] transition-colors px-2 py-4"
                >
                  See a Live Demo
                  <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right — Hero visual: overlapping photo composition with Ken Burns */}
            <div className="relative flex justify-center lg:justify-end py-8 lg:py-0 animate-[fadeUp_1s_ease_0.5s_both]">
              <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-[380px] mx-auto lg:ml-auto lg:mr-0">
                {/* Background decorative frame */}
                <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 w-full h-full border border-[var(--dash-text)]/30/40" />

                {/* Main image with Ken Burns */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <SafeImage
                    src="/demo/images/photo-1.jpg"
                    alt="Wedding couple"
                    fill
                    priority
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, 380px"
                    className="object-cover animate-[kenBurns_20s_ease-in-out_infinite_alternate] blur-[3px]"
                  />
                  {/* Overlay label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2d2b25]/70 to-transparent p-6 pt-16">
                    <p className="font-['Cormorant_Garamond',serif] text-[#faf1e1] text-xl italic">
                      K & M
                    </p>
                    <p className="font-['DM_Sans',sans-serif] text-[#faf1e1]/70 text-xs tracking-[0.15em] uppercase mt-1">
                      August 2026 &bull; Winnipeg
                    </p>
                  </div>
                </div>

                {/* Floating secondary image */}
                <div className="absolute -bottom-10 -left-8 w-40 h-48 overflow-hidden shadow-2xl hidden md:block animate-[float_6s_ease-in-out_infinite]">
                  <SafeImage
                    src="/demo/images/photo-2.jpg"
                    alt="Couple detail"
                    fill
                    sizes="160px"
                    className="object-cover blur-[3px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 animate-[fadeUp_0.8s_ease_1.2s_both]">
          <span className="font-['DM_Sans',sans-serif] text-[10px] tracking-[0.3em] uppercase text-[var(--dash-text)]/30">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[var(--dash-text)]/30 to-transparent animate-[breathe_2.5s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ============ SOCIAL PROOF LINE ============ */}
      <div className="border-y border-[var(--dash-text)]/[0.06] py-6 bg-[var(--dash-text)]/[0.04]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap justify-center gap-x-12 gap-y-3">
          {[
            "Fully customisable",
            "Beautiful templates",
            "Built-in RSVP",
            "Mobile responsive",
            "Free to start",
          ].map((item) => (
            <span
              key={item}
              className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.25em] uppercase text-[var(--dash-text)]/35"
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
          <ScrollReveal className="text-center mb-20 md:mb-28">
            <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--dash-text)]/40 mb-4">
              How It Works
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5vw,4rem)] leading-tight tracking-tight">
              Your site, live
              <br />
              <span className="italic font-light text-[var(--dash-text)]/50">
                in three steps
              </span>
            </h2>
          </ScrollReveal>

          {/* Steps with connecting line */}
          <ScrollReveal stagger={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px bg-[var(--dash-text)]/30/30" />

              {[
                {
                  num: "01",
                  title: "Pick a Template",
                  desc: "Choose from beautifully crafted templates designed for weddings. Each one is fully customisable — colours, fonts, photos, layout — make it yours.",
                  accent: "bg-[var(--dash-text)]/30/20",
                },
                {
                  num: "02",
                  title: "Add Your Details",
                  desc: "Fill in your wedding info, upload photos, set up your schedule, and enable RSVP. The live preview updates as you type — no code needed.",
                  accent: "bg-[var(--dash-text)]/[0.04]",
                },
                {
                  num: "03",
                  title: "Share With Guests",
                  desc: "Publish your site and share the link. Guests can RSVP, view the schedule, find venues, and explore your gallery — all from any device.",
                  accent: "bg-[var(--dash-text)]/30/15",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className={`group relative p-8 md:p-10 ${step.accent} hover:bg-[var(--dash-text)] transition-colors duration-500 cursor-default`}
                >
                  <span className="font-['Caveat',cursive] text-5xl md:text-6xl font-bold text-[var(--dash-text)]/40/30 group-hover:text-[var(--dash-bg)]/15 transition-colors duration-500 absolute top-4 right-6">
                    {step.num}
                  </span>
                  <div className="relative">
                    <div className="w-10 h-px bg-[var(--dash-text)]/20 group-hover:bg-[var(--dash-bg)]/20 mb-8 transition-colors duration-500" />
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl md:text-2xl mb-4 font-medium group-hover:text-[var(--dash-bg)] transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="font-['DM_Sans',sans-serif] text-sm leading-relaxed text-[var(--dash-text)]/60 group-hover:text-[var(--dash-bg)]/60 transition-colors duration-500">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <DiamondDivider />

      {/* ============ FEATURES ============ */}
      <section id="features" className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Feature visual */}
            <ScrollReveal className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Stacked card composition */}
                <div className="relative bg-[var(--dash-surface)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.06)] animate-[float_8s_ease-in-out_infinite]">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src="/demo/images/photo-4.jpg"
                      alt="Wedding website preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover blur-[3px]"
                    />
                  </div>
                </div>
                {/* Floating RSVP card mockup */}
                <div className="absolute -bottom-8 -right-4 md:-right-8 bg-[var(--dash-surface)] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] w-52">
                  <p className="font-['DM_Sans',sans-serif] text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--dash-text)]/40 mb-3">
                    RSVP Response
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600/70" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[var(--dash-text)]/70">
                        Attending — 42
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--dash-text)]/30" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[var(--dash-text)]/70">
                        Pending — 18
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <span className="font-['DM_Sans',sans-serif] text-xs text-[var(--dash-text)]/70">
                        Declined — 4
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right — Feature list */}
            <ScrollReveal className="order-1 lg:order-2" stagger={150}>
              <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--dash-text)]/40 mb-4">
                Features
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4.5vw,3.5rem)] leading-tight tracking-tight mb-12">
                Everything you need,
                <br />
                <span className="italic font-light text-[var(--dash-text)]/50">
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
                    title: "Fully Customisable",
                    desc: "Change colours, fonts, backgrounds, and layout for every section. Drag and drop to reorder. Make it truly yours.",
                  },
                  {
                    title: "Your Own Link",
                    desc: "Share a memorable link like yournames.ithinkshewifey.com that guests will actually remember.",
                  },
                  {
                    title: "Guest Management",
                    desc: "Track RSVPs, meal choices, and dietary requirements in real time — no spreadsheets needed.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group flex gap-5 items-start"
                  >
                    <div className="mt-2 w-2 h-2 rotate-45 border border-[var(--dash-text)]/30 group-hover:bg-[var(--dash-text)]/30 group-hover:rotate-[90deg] transition-all duration-500 shrink-0" />
                    <div>
                      <h3 className="font-['Cormorant_Garamond',serif] text-lg mb-1 font-medium">
                        {feature.title}
                      </h3>
                      <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-text)]/55 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <DiamondDivider />

      {/* ============ DEMO SHOWCASE ============ */}
      <section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal className="text-center mb-16">
            <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--dash-text)]/40 mb-4">
              Live Example
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5vw,4rem)] leading-tight tracking-tight">
              See it in action
            </h2>
            <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-text)]/50 mt-4 max-w-md mx-auto leading-relaxed">
              This is a real wedding website built on the platform — the
              wedding of Kifle & Milka, our very first couple.
            </p>
          </ScrollReveal>

          {/* Browser mockup with float animation */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="bg-[var(--dash-text)] rounded-t-lg p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--dash-bg)]/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--dash-bg)]/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--dash-bg)]/15" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-[var(--dash-bg)]/10 rounded-sm px-3 py-1 text-center">
                    <span className="font-['DM_Sans',sans-serif] text-[11px] text-[var(--dash-bg)]/40">
                      ithinkshewifey.com/demo
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/demo" className="block group relative">
                <div className="relative overflow-hidden border border-t-0 border-[var(--dash-text)]/10 aspect-[16/9]">
                  <SafeImage
                    src="/demo/images/photo-1.jpg"
                    alt="Adam & Eve wedding website demo"
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] blur-[3px]"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-[var(--dash-text)]/0 group-hover:bg-[var(--dash-text)]/40 transition-colors duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.15em] uppercase text-[var(--dash-bg)] border border-[var(--dash-bg)]/50 px-8 py-3">
                      View Live Demo
                    </span>
                  </div>
                </div>
              </Link>
              {/* Reflection shadow */}
              <div
                className="h-16 mx-6 opacity-30"
                style={{
                  background: "linear-gradient(to bottom, rgba(45,43,37,0.08), transparent)",
                }}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-24 md:py-36 bg-[var(--dash-text)]/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal className="text-center mb-16 md:mb-20">
            <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--dash-text)]/40 mb-4">
              Pricing
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5vw,4rem)] leading-tight tracking-tight">
              Simple, honest
              <br />
              <span className="italic font-light text-[var(--dash-text)]/50">
                pricing
              </span>
            </h2>
            <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-text)]/50 mt-4 max-w-lg mx-auto leading-relaxed">
              Build your entire site for free. Only pay when you&apos;re ready to go live.
              One price, everything included — no hidden fees, no monthly subscriptions.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
              {/* Free Plan */}
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-text)]/10 p-8 md:p-10 md:rounded-l-sm md:border-r-0 rounded-sm md:rounded-r-none">
                <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--dash-text)]/40 mb-3">
                  Free
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-['Cormorant_Garamond',serif] text-5xl font-light">
                    £0
                  </span>
                </div>
                <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-text)]/45 mb-8">
                  Build and preview your site
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    "Full site editor with live preview",
                    "All templates and colour themes",
                    "All font combinations",
                    "Drag-and-drop section ordering",
                    "Unlimited edits",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--dash-text)]/40" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-text)]/60">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="block text-center py-3.5 font-['DM_Sans',sans-serif] text-[12px] font-semibold tracking-[0.12em] uppercase border border-[var(--dash-text)]/20 text-[var(--dash-text)]/70 hover:border-[var(--dash-text)] hover:text-[var(--dash-text)] transition-all duration-300 rounded-sm"
                >
                  Start Building
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="relative bg-[var(--dash-text)] text-[var(--dash-bg)] p-8 md:p-10 md:rounded-r-sm rounded-sm md:rounded-l-none overflow-hidden">
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <circle cx="100" cy="0" r="80" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="0" r="60" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="0" r="40" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--dash-bg)]/50">
                      Premium
                    </p>
                    <span className="font-['DM_Sans',sans-serif] text-[9px] font-bold tracking-[0.15em] uppercase bg-[var(--dash-text)]/30/20 text-[var(--dash-text)]/40 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-['Cormorant_Garamond',serif] text-5xl font-light">
                      £50
                    </span>
                    <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-bg)]/35">
                      one-time
                    </span>
                  </div>
                  <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-bg)]/45 mb-8">
                    Publish your site and go live
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      "Everything in Free",
                      "Publish and share your live site",
                      "Custom domain support",
                      "Built-in RSVP with guest management",
                      "Gift registry and contributions",
                      "Email and SMS broadcasts",
                      "Photo gallery with uploads",
                      "No watermarks or branding",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--dash-text)]/40" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-bg)]/65">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/signup"
                    className="group block text-center py-3.5 font-['DM_Sans',sans-serif] text-[12px] font-semibold tracking-[0.12em] uppercase bg-[var(--dash-bg)] text-[var(--dash-text)] hover:bg-[var(--dash-text)]/30 transition-all duration-300 rounded-sm relative overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out]" style={{ backgroundSize: "200% 100%" }} />
                  </Link>

                  <p className="font-['DM_Sans',sans-serif] text-[10px] text-[var(--dash-bg)]/25 text-center mt-4 tracking-wide">
                    Pay once, yours forever. No subscriptions.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <DiamondDivider />

      {/* ============ CTA BAND ============ */}
      <section className="bg-[var(--dash-text)] py-20 md:py-28 relative overflow-hidden">
        {/* Animated concentric rings */}
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full border border-[var(--dash-bg)]/[0.04] animate-[ringPulse_8s_ease-in-out_infinite]" style={{ transform: "translate(-50%, -50%)" }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full border border-[var(--dash-bg)]/[0.03] animate-[ringPulse_8s_ease-in-out_2s_infinite]" style={{ transform: "translate(-50%, -50%)" }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full border border-[var(--dash-bg)]/[0.02] animate-[ringPulse_8s_ease-in-out_4s_infinite]" style={{ transform: "translate(-50%, -50%)" }} />

        <div className="relative max-w-3xl mx-auto px-6 md:px-10 text-center">
          <ScrollReveal>
            <p className="font-['Caveat',cursive] text-xl text-[var(--dash-text)]/40/70 mb-4">
              Your love story deserves a beautiful home
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5.5vw,4rem)] leading-tight text-[var(--dash-bg)] mb-6">
              Your wedding website,
              <br />
              <span className="italic font-light text-[var(--dash-text)]/40">
                ready in minutes
              </span>
            </h2>
            <p className="font-['DM_Sans',sans-serif] text-sm text-[var(--dash-bg)]/50 max-w-md mx-auto mb-10 leading-relaxed">
              Build for free, customise everything, and publish when
              you&apos;re ready. Your guests will love it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 bg-[var(--dash-bg)] text-[var(--dash-text)] px-8 py-4 font-['DM_Sans',sans-serif] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[var(--dash-text)]/30 transition-colors duration-300"
              >
                Get Started Free
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/demo"
                className="font-['DM_Sans',sans-serif] text-[13px] font-medium tracking-[0.08em] uppercase text-[var(--dash-bg)]/50 hover:text-[var(--dash-bg)] transition-colors px-4 py-4"
              >
                See the Demo
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[var(--dash-text)]/30/20 relative">
        <FlourishDivider />
        <div className="max-w-7xl mx-auto px-6 md:px-10 pb-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Link href="/" className="text-[var(--dash-text)] text-xl font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                ITSW
              </Link>
              <p className="font-['DM_Sans',sans-serif] text-[11px] text-[var(--dash-text)]/40 tracking-wide mt-1">
                Wedding websites, elevated.
              </p>
            </div>
            <div className="flex items-center gap-8">
              {[
                { label: "Demo", href: "/demo" },
                { label: "Pricing", href: "#pricing" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-['DM_Sans',sans-serif] text-[12px] tracking-[0.1em] uppercase text-[var(--dash-text)]/45 hover:text-[var(--dash-text)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="h-px bg-[var(--dash-text)]/10 my-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-['DM_Sans',sans-serif] text-[11px] text-[var(--dash-text)]/30">
              &copy; 2026 2 Percent Cargo Ltd.
            </p>
            <div className="flex items-center gap-3 font-['DM_Sans',sans-serif] text-[11px] text-[var(--dash-text)]/25">
              <span>Created by</span>
                {/* GitHub */}
                <a href="https://github.com/abeallin" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-[var(--dash-text)]/25 hover:text-[var(--dash-text)] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <span className="opacity-30">·</span>
                <span>Contact</span>
                {/* Email */}
                <a href="mailto:abelghebz@gmail.com" aria-label="Email" className="text-[var(--dash-text)]/25 hover:text-[var(--dash-text)] transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13 2 4" />
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="https://wa.me/447527841324" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-[var(--dash-text)]/25 hover:text-[var(--dash-text)] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <span className="opacity-30">·</span>
                <span>Donate</span>
                {/* Ko-fi */}
                <a href="https://ko-fi.com/abeallin" target="_blank" rel="noopener noreferrer" aria-label="Ko-fi" className="text-[var(--dash-text)]/25 hover:text-[var(--dash-text)] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.681-4.011 3.681s-.065.064-.16.033c-.1-.033-.078-.13-.078-.13s-.513-1.304-.723-2.123c-.582-2.27.326-3.432 1.078-4.16.755-.733 1.524-1.261 1.914-2.072.39-.811.333-1.932-.333-2.503-.666-.57-1.893-.51-2.56.166-.667.676-.853 1.573-.853 1.573L5.68 6.775s.578-2.397 2.732-3.171c2.153-.774 4.17.11 4.833 1.335.666 1.225.49 3.168-.426 4.52z" />
                  </svg>
                </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </ThemeProvider>
  );
}
