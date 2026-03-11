import type { WeddingSite } from "@/lib/types/wedding-site";
import { DEFAULT_SECTION_ORDER } from "@/lib/types/wedding-site";
import { getTheme } from "@/lib/themes";
import WeddingSiteClient from "./WeddingSiteClient";
import "./styles.css";

export default function ElegantCreamTemplate({ site }: { site: WeddingSite }) {
  const theme = getTheme(site.templateId);
  const themeVars = {
    "--color-dark": theme.colors.dark,
    "--color-tan": theme.colors.tan,
    "--color-cream": theme.colors.cream,
    "--color-tan-light": theme.colors.tanLight,
    "--color-tan-dark": theme.colors.tanDark,
    "--color-cream-dark": theme.colors.creamDark,
    "--font-script": theme.fonts.script,
    "--font-serif": theme.fonts.serif,
    "--font-sans": theme.fonts.sans,
  } as React.CSSProperties;

  const order = site.sectionOrder ?? DEFAULT_SECTION_ORDER;

  // Build a map of section ID -> visible nav links
  const visibleSections = new Set(order.filter((s) => s.visible).map((s) => s.id));

  const navItems = [
    { id: "details", label: "Details" },
    { id: "schedule", label: "Schedule" },
    { id: "menu", label: "Menu" },
    { id: "accommodations", label: "Stay" },
    { id: "explore", label: "Explore" },
    { id: "gallery", label: "Gallery" },
    { id: "rsvp", label: "RSVP" },
    { id: "contact", label: "Contact" },
  ].filter((item) => visibleSections.has(item.id));

  // Section renderers
  const sections: Record<string, () => React.ReactNode> = {
    hero: () => (
      <section className="hero" id="hero">
        <div className="hero__bg" style={{
          background: `linear-gradient(180deg, rgba(45,43,37,0.25) 0%, rgba(45,43,37,0.4) 100%), url('${site.heroImageUrl}') center/cover no-repeat`,
        }}></div>
        <div className="hero__content">
          <p className="hero__pretext">{site.heroPretext}</p>
          <h1 className="hero__names">
            {site.partner1Name} <span className="hero__ampersand">&amp;</span> {site.partner2Name}
          </h1>
          <div className="hero__line"></div>
          <p className="hero__tagline">{site.heroTagline}</p>
          <a href="#rsvp" className="hero__btn">{site.heroCta}</a>
          <p className="hero__date-line">
            {site.dateDisplayText} &bull; {site.locationText}
          </p>
          <div className="hero__countdown" aria-label="Countdown to wedding">
            <div className="countdown__item">
              <div className="countdown__number" id="countdown-days">---</div>
              <div className="countdown__label">Days</div>
            </div>
            <div className="countdown__item">
              <div className="countdown__number" id="countdown-hours">--</div>
              <div className="countdown__label">Hours</div>
            </div>
            <div className="countdown__item">
              <div className="countdown__number" id="countdown-mins">--</div>
              <div className="countdown__label">Minutes</div>
            </div>
            <div className="countdown__item">
              <div className="countdown__number" id="countdown-secs">--</div>
              <div className="countdown__label">Seconds</div>
            </div>
          </div>
        </div>
      </section>
    ),

    story: () => (
      <section className="section section--tan" id="story">
        <div className="container">
          <div className="section__header reveal">
            <p className="section__subtitle">{site.storySubtitle}</p>
            <h2 className="section__title">{site.storyTitle}</h2>
            <div className="section__line"></div>
          </div>
          <div className="story">
            <div className="story__text-block reveal">
              <p className="story__lead">&ldquo;{site.storyLeadQuote}&rdquo;</p>
              {site.storyBody.map((p, i) => (
                <p key={i} className="story__text">{p}</p>
              ))}
            </div>
            <img
              className="story__img reveal reveal-delay-1"
              src={site.storyImageUrl}
              alt={`${site.partner1Name} and ${site.partner2Name}`}
              data-zoomable
              loading="lazy"
            />
          </div>
        </div>
      </section>
    ),

    details: () => (
      <section className="section section--tan" id="details">
        <div className="container">
          <div className="section__header reveal">
            <p className="section__subtitle">The Celebration</p>
            <h2 className="section__title">Wedding Details</h2>
            <div className="section__line"></div>
          </div>
          <div className="info-grid">
            {site.venues.map((venue, i) => (
              <div key={i} className={`info-card reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
                <div className="info-card__label">{venue.label}</div>
                <h3 className="info-card__title">{venue.name}</h3>
                <p className="info-card__text">
                  {venue.address.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < venue.address.split("\n").length - 1 && <br />}</span>
                  ))}
                </p>
                <p className="info-card__time">{venue.time}</p>
                {venue.mapsEmbedUrl && (
                  <iframe
                    className="info-card__map"
                    src={venue.mapsEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${venue.label} venue map`}
                  ></iframe>
                )}
              </div>
            ))}
          </div>
          {site.venueInfoBlocks.length > 0 && (
            <div className="details-split reveal">
              {site.venueInfoBlocks.map((block, i) => (
                <div key={i} className="venue-info">
                  {block.heading && <h3 className="venue-info__heading">{block.heading}</h3>}
                  {block.subheading && <div className="venue-info__subheading">{block.subheading}</div>}
                  {block.text.split("\n").map((line, j) => {
                    if (j === 0) return <p key={j} className="venue-info__text">{line}</p>;
                    return <p key={j} className="venue-info__address">{line}</p>;
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    ),

    day2: () => {
      if (!site.dayTwoEvent) return null;
      return (
        <section className="section section--cream" id="day2">
          <div className="container">
            <div className="day2 reveal">
              <h2 className="day2__heading">{site.dayTwoEvent.heading}</h2>
              <p className="day2__time">{site.dayTwoEvent.time}</p>
              <p className="day2__address">
                {site.dayTwoEvent.address.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < site.dayTwoEvent!.address.split("\n").length - 1 && <br />}</span>
                ))}
              </p>
              <p className="day2__note">{site.dayTwoEvent.note}</p>
            </div>
          </div>
        </section>
      );
    },

    quote: () => {
      if (!site.quoteText) return null;
      return (
        <section className="section section--cream">
          <div className="container">
            <div className="quote-section reveal">
              <p className="quote__text">&ldquo;{site.quoteText}&rdquo;</p>
              <p className="quote__attribution">{site.quoteAttribution}</p>
            </div>
          </div>
        </section>
      );
    },

    featuredPhoto: () => {
      if (!site.featuredPhotoUrl) return null;
      return (
        <section className="section section--cream">
          <div className="container">
            <div className="featured-photo reveal">
              <img
                className="featured-photo__img"
                src={site.featuredPhotoUrl}
                alt={`${site.partner1Name} and ${site.partner2Name}`}
                data-zoomable
                loading="lazy"
              />
              <p className="featured-photo__caption">{site.featuredPhotoCaption}</p>
            </div>
          </div>
        </section>
      );
    },

    letter: () => {
      if (!site.letterOpening) return null;
      return (
        <section className="section section--dark">
          <div className="container">
            <div className="letter reveal">
              <p className="letter__opening">{site.letterOpening}</p>
              {site.letterBody.map((p, i) => (
                <p key={i} className="letter__body">{p}</p>
              ))}
              <p className="letter__closing">{site.letterClosing}</p>
            </div>
          </div>
        </section>
      );
    },

    schedule: () => {
      // Support both legacy scheduleItems and new weddingDays
      const days = site.weddingDays?.filter((d) => !d.isPrivate) ?? (
        site.scheduleItems.length > 0
          ? [{ label: "", date: "", isPrivate: false, items: site.scheduleItems }]
          : []
      );
      if (days.length === 0) return null;

      const renderTimeline = (items: typeof site.scheduleItems) => (
        <div className="timeline">
          {items.map((item, i) => (
            <div key={i} className="timeline__item reveal">
              <div className="timeline__time">
                <div className="timeline__hour">{item.hour}</div>
                <div className="timeline__period">{item.period}</div>
              </div>
              <div className="timeline__details">
                <h3 className="timeline__event">{item.event}</h3>
                {item.venue && <p className="timeline__venue">{item.venue}</p>}
                {item.description && <p className="timeline__desc">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      );

      return (
        <section className="section section--tan" id="schedule">
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">The Day{days.length > 1 ? "s" : ""}</p>
              <h2 className="section__title">Schedule</h2>
              <div className="section__line"></div>
            </div>
            {days.map((day, di) => (
              <div key={di} className="schedule-day">
                {day.label && <h3 className="schedule-day__label">{day.label}</h3>}
                {day.date && <p className="schedule-day__date">{day.date}</p>}
                {renderTimeline(day.items)}
              </div>
            ))}
          </div>
        </section>
      );
    },

    menu: () => {
      if (site.menuItems.length === 0) return null;
      return (
        <section className="section section--dark" id="menu">
          <div className="container">
            <div className="menu-section reveal">
              <h2 className="menu__heading">Menu</h2>
              {site.menuItems.map((item, i) => (
                <div key={i} className="menu__item">
                  <div className="menu__item-name">{item.name}</div>
                  <p className="menu__item-desc">
                    {item.description.split("\n").map((line, j) => (
                      <span key={j}>{line}{j < item.description.split("\n").length - 1 && <br />}</span>
                    ))}
                  </p>
                </div>
              ))}
              {site.menuNote && <p className="menu__note">{site.menuNote}</p>}
            </div>
          </div>
        </section>
      );
    },

    gallery: () => {
      if (site.galleryImages.length === 0) return null;
      return (
        <section className="section section--dark gallery-dark" id="gallery">
          <div className="gallery-dark__bg"></div>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Moments</p>
              <h2 className="section__title">Our Gallery</h2>
              <div className="section__line"></div>
            </div>
            <div className="gallery-float reveal">
              {site.galleryImages.map((img, i) => (
                <img
                  key={i}
                  className="gallery-float__img"
                  src={img.url}
                  alt={img.alt}
                  data-zoomable
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      );
    },

    explore: () => {
      if (site.exploreGroups.length === 0) return null;
      return (
        <section className="section section--tan" id="explore">
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">While You&rsquo;re Here</p>
              <h2 className="section__title">Things to Do</h2>
              <div className="section__line"></div>
            </div>
            <div className="explore-grid">
              {site.exploreGroups.map((group, i) => (
                <div key={i} className={`reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
                  <h3 className="explore-col__heading">{group.heading}</h3>
                  <ul className="explore-col__list">
                    {group.links.map((link, j) => (
                      <li key={j}>
                        <a href={link.url} target="_blank" rel="noopener">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                  {group.subheading && (
                    <div className="explore-col__subheading">{group.subheading}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    accommodations: () => {
      if (site.accommodations.length === 0) return null;
      return (
        <section className="section section--dark" id="accommodations">
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Where to Stay</p>
              <h2 className="section__title">Accommodations</h2>
              <div className="section__line"></div>
            </div>
            <div className="hotels-grid">
              {site.accommodations.map((hotel, i) => (
                <div key={i} className={`hotel-card reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
                  {hotel.badge && <span className="hotel-card__badge">{hotel.badge}</span>}
                  <h3 className="hotel-card__name">{hotel.name}</h3>
                  <p className="hotel-card__distance">{hotel.distance}</p>
                  <p className="hotel-card__desc">{hotel.description}</p>
                  {hotel.discountCode && (
                    <div className="hotel-card__discount">
                      <span className="hotel-card__discount-label">Discount Code</span>
                      <span className="hotel-card__discount-code">{hotel.discountCode}</span>
                    </div>
                  )}
                  <a href={hotel.bookingUrl} target="_blank" rel="noopener" className="hotel-card__link">
                    Book Your Stay
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    rsvp: () => (
      <section className="section section--tan" id="rsvp">
        <div className="container">
          <div className="rsvp__form-wrap reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h2 className="rsvp__heading">{site.rsvpHeading}</h2>
            <p className="rsvp__subheading" style={{ marginBottom: "2rem" }}>{site.rsvpDeadlineText}</p>
            <iframe
              data-tally-src={site.rsvpEmbedUrl}
              loading="lazy"
              width="100%"
              height={500}
              frameBorder={0}
              marginHeight={0}
              marginWidth={0}
              title="Wedding RSVP"
              style={{ minHeight: 500 }}
            ></iframe>
          </div>
        </div>
      </section>
    ),

    gift: () => {
      if (!site.giftHeading) return null;
      return (
        <section className="section section--cream" id="gift">
          <div className="container">
            <div className="gift-section reveal">
              <h2 className="gift__heading">{site.giftHeading}</h2>
              <p className="gift__subheading">{site.giftSubheading}</p>
              <a href={site.giftPaymentUrl} target="_blank" rel="noopener noreferrer" className="gift__paypal-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337zm7.874-15.09c-.256 0-.51.02-.758.06-.876.14-1.594.673-1.955 1.456a3.12 3.12 0 0 0-.263 1.282c0 1.14.706 1.906 2.052 1.906h.882c2.582 0 4.263-1.063 4.87-3.842.044-.2.073-.39.09-.57.1-1.06-.587-2.292-4.918-2.292z" />
                </svg>
                {site.giftPaymentLabel}
              </a>
              <p className="gift__note">{site.giftNote}</p>
            </div>
          </div>
        </section>
      );
    },

    contact: () => {
      if (site.contactEntries.length === 0) return null;
      return (
        <section className="section section--cream" id="contact">
          <div className="container">
            <div className="contact-section reveal">
              <h2 className="contact__heading">{site.contactHeading || "Get in Touch"}</h2>
              <p className="contact__subheading">Questions? We&rsquo;d love to hear from you</p>
              <div className="contact__entries">
                {site.contactEntries.map((c, i) => (
                  <div key={i} className="contact__entry">
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    {c.phone && <><br /><a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },

    footer: () => (
      <footer className="footer">
        <p className="footer__names">{site.footerNames}</p>
        <p className="footer__date">{site.footerDateText}</p>
        <div className="footer__line"></div>
        <p className="footer__copy">{site.footerCopyright}</p>
        {site.footerDevCredit && (
          <p className="footer__dev" dangerouslySetInnerHTML={{ __html: site.footerDevCredit }} />
        )}
      </footer>
    ),
  };

  return (
    <div className="wedding-site" style={themeVars}>
      <WeddingSiteClient weddingDate={site.weddingDate} tallyUrl={site.rsvpEmbedUrl} />

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={theme.googleFontsUrl} rel="stylesheet" />

      {/* Lightbox */}
      <div className="lightbox" id="lightbox">
        <button className="lightbox__close" aria-label="Close">&times;</button>
        <img className="lightbox__img" id="lightbox-img" alt="" />
      </div>

      {/* Navigation */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <a href="#hero" className="nav__brand">{site.navBrand}</a>
        <button className="nav__toggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <ul className="nav__links">
          {navItems.map((item) => (
            <li key={item.id}><a href={`#${item.id}`} className="nav__link">{item.label}</a></li>
          ))}
        </ul>
      </nav>

      {/* Render sections in order */}
      {order.map((section) => {
        if (!section.visible) return null;
        const render = sections[section.id];
        if (!render) return null;
        return <div key={section.id}>{render()}</div>;
      })}
    </div>
  );
}
