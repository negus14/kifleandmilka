import type { WeddingSite } from "@/lib/types/wedding-site";
import { getTheme } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import RSVPForm from "@/components/RSVPForm";
import "./styles.css";

export function ClassicTemplate({ site }: { site: WeddingSite }) {
  const theme = getTheme(site.templateId);
  const themeVars = generateThemeVars(site.templateId);
  const { order, visibleSections, navItems } = getSectionData(site);

  // Section renderers
  const sections: Record<string, (cls?: string, style?: React.CSSProperties) => React.ReactNode> = {
    hero: () => (
      <section className="hero" id="hero">
        <div className="hero__bg" style={{
          background: `linear-gradient(180deg, color-mix(in srgb, var(--color-dark), transparent 75%) 0%, color-mix(in srgb, var(--color-dark), transparent 60%) 100%), url('${site.heroImageUrl}') center/cover no-repeat`,
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

    story: (cls = "", style = {}) => (
      <section className={`section ${cls || "section--tan"}`} id="story" style={style}>
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

    details: (cls = "", style = {}) => {
      const detailsStyle = site.detailsStyle || "grid";

      const renderVenueCard = (venue: typeof site.venues[0], i: number) => (
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
              src={toEmbedUrl(venue.mapsEmbedUrl)}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${venue.label} venue map`}
            ></iframe>
          )}
        </div>
      );

      const renderInfoBlock = (block: typeof site.venueInfoBlocks[0], i: number) => (
        <div key={i} className="venue-info">
          {block.heading && <h3 className="venue-info__heading">{block.heading}</h3>}
          {block.subheading && <div className="venue-info__subheading">{block.subheading}</div>}
          {block.text.split("\n").map((line, j) => {
            if (j === 0) return <p key={j} className="venue-info__text">{line}</p>;
            return <p key={j} className="venue-info__address">{line}</p>;
          })}
        </div>
      );

      if (detailsStyle === "split") {
        return (
          <section className={`section ${cls || "section--tan"}`} id="details" style={style}>
            <div className="container">
              <div className="details-split-layout">
                <div className="details-split__venues">
                  {site.venues.map(renderVenueCard)}
                </div>
                <div className="details-split__info">
                  <div className="section__header reveal" style={{ textAlign: "left", marginBottom: "2rem" }}>
                    <p className="section__subtitle">The Celebration</p>
                    <h2 className="section__title">Essential Info</h2>
                    <div className="section__line" style={{ margin: "1.25rem 0 0" }}></div>
                  </div>
                  {site.venueInfoBlocks.map(renderInfoBlock)}
                </div>
              </div>
            </div>
          </section>
        );
      }

      if (detailsStyle === "minimal") {
        return (
          <section className={`section ${cls || "section--tan"}`} id="details" style={style}>
            <div className="container">
              <div className="section__header reveal">
                <p className="section__subtitle">The Celebration</p>
                <h2 className="section__title">Wedding Details</h2>
                <div className="section__line"></div>
              </div>
              <div className="details-minimal">
                {site.venues.map((v, i) => (
                  <div key={i} className="details-minimal__item reveal">
                    <div className="details-minimal__label">{v.label}</div>
                    <div className="details-minimal__main">
                      <h3 className="details-minimal__name">{v.name}</h3>
                      <p className="details-minimal__time">{v.time}</p>
                    </div>
                    <p className="details-minimal__address">{v.address.replace("\n", ", ")}</p>
                  </div>
                ))}
              </div>
              {site.venueInfoBlocks.length > 0 && (
                <div className="details-minimal__info reveal">
                  {site.venueInfoBlocks.map(renderInfoBlock)}
                </div>
              )}
            </div>
          </section>
        );
      }

      // Default: Grid
      return (
        <section className={`section ${cls || "section--tan"}`} id="details" style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">The Celebration</p>
              <h2 className="section__title">Wedding Details</h2>
              <div className="section__line"></div>
            </div>
            <div className="info-grid">
              {site.venues.map(renderVenueCard)}
            </div>
            {site.venueInfoBlocks.length > 0 && (
              <div className="details-split reveal">
                {site.venueInfoBlocks.map(renderInfoBlock)}
              </div>
            )}
          </div>
        </section>
      );
    },

    day2: (cls = "", style = {}) => {
      if (!site.dayTwoEvent) return null;
      return (
        <section className={`section ${cls || "section--cream"}`} id="day2" style={style}>
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

    quote: (cls = "", style = {}) => {
      if (!site.quoteText) return null;
      return (
        <section className={`section ${cls || "section--cream"}`} style={style}>
          <div className="container">
            <div className="quote-section reveal">
              <p className="quote__text">&ldquo;{site.quoteText}&rdquo;</p>
              <p className="quote__attribution">{site.quoteAttribution}</p>
            </div>
          </div>
        </section>
      );
    },

    featuredPhoto: (cls = "", style = {}) => {
      if (!site.featuredPhotoUrl) return null;
      return (
        <section className={`section ${cls || "section--cream"}`} style={style}>
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

    letter: (cls = "", style = {}) => {
      if (!site.letterOpening) return null;
      return (
        <section className={`section ${cls || "section--dark"}`} style={style}>
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

    schedule: (cls = "", style = {}) => {
      // Support both legacy scheduleItems and new weddingDays
      const days = site.weddingDays?.filter((d) => !d.isPrivate) ?? (
        site.scheduleItems.length > 0
          ? [{ label: "", date: "", isPrivate: false, items: site.scheduleItems }]
          : []
      );
      if (days.length === 0) return null;

      const renderTimeline = (items: typeof site.scheduleItems) => {
        const scheduleStyle = site.scheduleStyle || "classic";

        if (scheduleStyle === "minimal") {
          return (
            <div className="timeline-minimal">
              {items.map((item, i) => (
                <div key={i} className="timeline-minimal__item reveal">
                  <div className="timeline-minimal__time">
                    {item.hour} {item.period}
                  </div>
                  <div className="timeline-minimal__dot"></div>
                  <div className="timeline-minimal__details">
                    <h3 className="timeline-minimal__event">{item.event}</h3>
                    {item.venue && <span className="timeline-minimal__venue">at {item.venue}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (scheduleStyle === "cards") {
          return (
            <div className="timeline-cards">
              {items.map((item, i) => (
                <div key={i} className="timeline-card reveal">
                  <div className="timeline-card__time">{item.hour} {item.period}</div>
                  <h3 className="timeline-card__event">{item.event}</h3>
                  {item.venue && <p className="timeline-card__venue">{item.venue}</p>}
                  {item.description && <p className="timeline-card__desc">{item.description}</p>}
                </div>
              ))}
            </div>
          );
        }

        // Default: Classic
        return (
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
      };

      return (
        <section className={`section ${cls || "section--tan"}`} id="schedule" style={style}>
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

    menu: (cls = "", style = {}) => {
      if (site.menuItems.length === 0) return null;
      return (
        <section className={`section ${cls || "section--dark"}`} id="menu" style={style}>
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

    gallery: (cls = "", style = {}) => {
      if (site.galleryImages.length === 0) return null;
      const isCustomBg = !!site.sectionBackgrounds?.gallery;
      return (
        <section className={`section ${cls || "section--dark"} gallery-dark`} id="gallery" style={style}>
          {!isCustomBg && <div className="gallery-dark__bg"></div>}
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

    explore: (cls = "", style = {}) => {
      if (site.exploreGroups.length === 0) return null;
      return (
        <section className={`section ${cls || "section--tan"}`} id="explore" style={style}>
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

    accommodations: (cls = "", style = {}) => {
      if (site.accommodations.length === 0) return null;
      return (
        <section className={`section ${cls || "section--dark"}`} id="accommodations" style={style}>
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

    rsvp: (cls = "", style = {}) => (
      <section className={`section ${cls || "section--tan"}`} id="rsvp" style={style}>
        <div className="container">
          <div className="rsvp__form-wrap reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h2 className="rsvp__heading">{site.rsvpHeading}</h2>
            <p className="rsvp__subheading">{site.rsvpDeadlineText}</p>
            <RSVPForm slug={site.slug} mealOptions={site.rsvpMealOptions} showHalalOption={site.showHalalOption ?? true} />
          </div>
        </div>
      </section>
    ),

    gift: (cls = "", style = {}) => {
      if (!site.giftHeading) return null;

      const paymentLinks = [...(site.giftPaymentLinks || [])];
      if (paymentLinks.length === 0 && site.giftPaymentUrl && site.giftPaymentLabel) {
        paymentLinks.push({ label: site.giftPaymentLabel, url: site.giftPaymentUrl });
      }

      const hasBankDetails = (site.giftBankDetails?.length ?? 0) > 0 || site.giftBankName || site.giftAccountNumber;
      const hasAnyGifts = paymentLinks.length > 0 || hasBankDetails;

      if (!hasAnyGifts) return null;

      return (
        <section className={`section ${cls || "section--cream"}`} id="gift" style={style}>
          <div className="container">
            <div className="gift-section reveal">
              <h2 className="gift__heading">{site.giftHeading}</h2>
              <p className="gift__subheading">{site.giftSubheading}</p>
              
              <div className="gift__dropdown-wrap">
                <div className="gift__dropdown">
                  <button className="gift__dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                    Choose a Gift Method
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  
                  <div className="gift__dropdown-menu">
                    {/* Payment Links (Stripe, PayPal, etc.) */}
                    {paymentLinks.map((link, i) => (
                      <a key={`link-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="gift__dropdown-item gift__dropdown-item--link">
                        <span className="gift__item-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        </span>
                        {link.label}
                      </a>
                    ))}

                    {/* Bank Transfer Options */}
                    {site.giftBankDetails?.map((bank, i) => (
                      <div key={`bank-${i}`} className="gift__dropdown-item gift__dropdown-item--bank">
                        <div className="gift__bank-header">
                          <span className="gift__item-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                          </span>
                          {bank.label}
                        </div>
                        <div className="gift__bank-details-mini">
                          {bank.accountHolder && <div className="gift__mini-row"><span>Holder:</span> <strong>{bank.accountHolder}</strong></div>}
                          {bank.email && (
                            <div className="gift__mini-row">
                              <span>Email:</span> 
                              <strong>{bank.email}</strong>
                              <button className="bank-copy-btn" data-copy={bank.email} title="Copy Email">Copy</button>
                            </div>
                          )}
                          {bank.sortCode && (
                            <div className="gift__mini-row">
                              <span>Sort:</span> 
                              <strong>{bank.sortCode}</strong>
                              <button className="bank-copy-btn" data-copy={bank.sortCode} title="Copy Sort Code">Copy</button>
                            </div>
                          )}
                          {bank.accountNumber && (
                            <div className="gift__mini-row">
                              <span>Account:</span> 
                              <strong>{bank.accountNumber}</strong>
                              <button className="bank-copy-btn" data-copy={bank.accountNumber} title="Copy Account Number">Copy</button>
                            </div>
                          )}
                          {bank.swiftCode && (
                            <div className="gift__mini-row">
                              <span>SWIFT:</span> 
                              <strong>{bank.swiftCode}</strong>
                              <button className="bank-copy-btn" data-copy={bank.swiftCode} title="Copy SWIFT">Copy</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="gift__note">{site.giftNote}</p>
            </div>
          </div>
        </section>
      );
    },

    contact: (cls = "", style = {}) => {
      if (site.contactEntries.length === 0) return null;
      return (
        <section className={`section ${cls || "section--cream"}`} id="contact" style={style}>
          <div className="container">
            <div className="contact-section reveal">
              <h2 className="contact__heading">{site.contactHeading || "Get in Touch"}</h2>
              <p className="contact__subheading">Questions? We&rsquo;d love to hear from you</p>
              <div className="contact__entries">
                {site.contactEntries.map((c, i) => (
                  <div key={i} className="contact__entry">
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    {c.phone && (
                      <div className="contact__phone-wrap">
                        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="contact__phone-number">{c.phone}</a>
                        <div className="contact__phone-actions">
                          <a href={`sms:${c.phone.replace(/\s/g, "")}`} title="Text Message" className="contact__phone-action">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </a>
                          <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="contact__phone-action">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },

    footer: (cls = "", style = {}) => (
      <footer className={`footer ${cls}`} style={style}>
        <p className="footer__names">{site.footerNames}</p>
        <p className="footer__date">{site.footerDateText}</p>
        <div className="footer__line"></div>
        <p className="footer__copy">{site.footerCopyright}</p>
        {site.footerDevCredit && (
          <div className="footer__dev" dangerouslySetInnerHTML={{ __html: site.footerDevCredit }} />
        )}
      </footer>
    ),
  };

  return (
    <div className="wedding-site" style={themeVars}>
      <WeddingSiteClient weddingDate={site.weddingDate} scheduleStyle={site.scheduleStyle} />

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

        const bgUrl = site.sectionBackgrounds?.[section.id];
        const extraClass = bgUrl ? "section--has-bg section--light-text" : "";
        const extraStyle = bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {};

        return <div key={section.id}>{render(extraClass, extraStyle)}</div>;
      })}
    </div>
  );
}

export default ClassicTemplate;
