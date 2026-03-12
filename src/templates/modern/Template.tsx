import type { WeddingSite, VenueItem, VenueInfoBlock } from "@/lib/types/wedding-site";
import { getTheme } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import RSVPForm from "@/components/RSVPForm";
import "./styles.css";

export function ModernTemplate({ site, isPreview }: { site: WeddingSite; isPreview?: boolean }) {
  const theme = getTheme(site.templateId);
  const themeVars = generateThemeVars(site.templateId);
  const { order, visibleSections, navItems } = getSectionData(site);

  const d = <T,>(id: string, key: string, fallback: T): T => (site.sectionData?.[id]?.[key] as T) ?? fallback;

  const sections: Record<string, (id: string, cls?: string, style?: React.CSSProperties) => React.ReactNode> = {
    hero: (id, cls = "", style = {}) => (
      <header className={`modern-hero ${cls}`} id={id} style={style}>
        <div className="modern-hero__bg"></div>
        <div className="modern-container">
          <div className="modern-hero__content reveal">
            <p className="modern-hero__pretext">{d(id, 'pretext', site.heroPretext)}</p>
            <h1 className="modern-hero__names">
              {site.partner1Name} <span className="modern-amp">&</span> {site.partner2Name}
            </h1>
            <p className="modern-hero__tagline">{d(id, 'tagline', site.heroTagline)}</p>
            <div className="modern-hero__date-loc">
              <span className="modern-hero__date">{site.dateDisplayText}</span>
              <span className="modern-hero__sep">|</span>
              <span className="modern-hero__loc">{site.locationText}</span>
            </div>
            <a href="#rsvp" className="modern-btn modern-btn--primary">{d(id, 'cta', site.heroCta)}</a>
          </div>
        </div>
      </header>
    ),

    story: (id, cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id={id} style={style}>
        <div className="modern-container">
          <div className="modern-grid modern-grid--2col">
            <div className="modern-story__img-wrap reveal">
              <img src={d(id, 'imageUrl', site.storyImageUrl)} alt={d(id, 'title', site.storyTitle)} className="modern-story__img" />
            </div>
            <div className="modern-story__content reveal">
              <p className="modern-subtitle">{d(id, 'subtitle', site.storySubtitle)}</p>
              <h2 className="modern-title">{d(id, 'title', site.storyTitle)}</h2>
              <blockquote className="modern-quote">{d(id, 'leadQuote', site.storyLeadQuote)}</blockquote>
              <div className="modern-text">
                {d(id, 'body', site.storyBody).map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    quote: (id, cls = "", style = {}) => {
      const text = d(id, 'text', site.quoteText);
      if (!text) return null;
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow text-center reveal">
            <h2 className="modern-quote modern-quote--large">"{text}"</h2>
            <p className="modern-quote-attr">— {d(id, 'attribution', site.quoteAttribution)}</p>
          </div>
        </section>
      );
    },

    featuredPhoto: (id, cls = "", style = {}) => {
      const url = d(id, 'url', site.featuredPhotoUrl);
      if (!url) return null;
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <div className="modern-featured-photo reveal">
              <img 
                src={url} 
                alt="Featured" 
                className="modern-featured-photo__img" 
                data-zoomable 
              />
              <p className="modern-featured-photo__caption">{d(id, 'caption', site.featuredPhotoCaption)}</p>
            </div>
          </div>
        </section>
      );
    },

    letter: (id, cls = "", style = {}) => {
      const opening = d(id, 'opening', site.letterOpening);
      if (!opening) return null;

      // If parent didn't provide a background (tan or has-bg), default to dark for the letter
      const finalCls = cls.includes('modern-section--tan') || cls.includes('modern-section--has-bg') ? cls : `modern-section--dark ${cls}`;

      return (
        <section className={`modern-section ${finalCls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow">
            <div className="modern-letter reveal">
              <p className="modern-letter__opening">{opening}</p>
              {d(id, 'body', site.letterBody).map((p: string, i: number) => (
                <p key={i} className="modern-letter__body">{p}</p>
              ))}
              <p className="modern-letter__closing">{d(id, 'closing', site.letterClosing)}</p>
            </div>
          </div>
        </section>
      );
    },

    menu: (id, cls = "", style = {}) => {
      if (site.menuItems.length === 0) return null;
      
      // If parent didn't provide a background (tan or has-bg), default to dark for the menu
      const finalCls = cls.includes('modern-section--tan') || cls.includes('modern-section--has-bg') ? cls : `modern-section--dark ${cls}`;

      return (
        <section className={`modern-section ${finalCls}`} id={id} style={style}>
          <div className="modern-container text-center">
            <h2 className="modern-title reveal">Menu</h2>
            <div className="modern-grid modern-grid--3col">
              {site.menuItems.map((item, i) => (
                <div key={i} className="reveal">
                  <h3 className="modern-card__title" style={{ fontSize: '1.4rem' }}>{item.name}</h3>
                  <p className="modern-text--small">{item.description}</p>
                </div>
              ))}
            </div>
            {site.menuNote && <p className="modern-text--small mt-12 italic reveal">{site.menuNote}</p>}
          </div>
        </section>
      );
    },

    details: (id, cls = "", style = {}) => {
      if (!site.eventDays || site.eventDays.length === 0) return null;
      const isPrv = cls.includes("preview");

      const renderVenueCard = (venue: VenueItem, i: number) => (
        <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
          <p className="modern-card__label">{venue.label}</p>
          <h3 className="modern-card__title">{venue.name}</h3>
          <p className="modern-card__text">{venue.address}</p>
          <p className="modern-card__time">{venue.time}</p>
          {venue.mapsEmbedUrl && (
            <iframe 
              src={toEmbedUrl(venue.mapsEmbedUrl)} 
              className="modern-card__map" 
              loading="lazy" 
              title={`${venue.label} location map`}
            />
          )}
        </div>
      );

      const renderInfoBlock = (block: VenueInfoBlock, i: number) => (
        <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
          {block.heading && <h3 className="modern-card__title">{block.heading}</h3>}
          <p className="modern-card__text">{block.text}</p>
        </div>
      );

      return (
        <>
          {site.eventDays.map((day, di) => {
            const dayStyle = day.detailsStyle || "grid";
            const bgUrl = day.sectionBackground;
            const dayBgColor = day.sectionBackgroundColor;

            // Clean up cls from parent to avoid conflicts with our own backgrounds
            const cleanCls = cls.replace(/modern-section--tan/g, "").trim();

            // Background color logic:
            // 1. Image background (overrides everything)
            // 2. Explicitly selected background color
            // 3. Alternating background (tan/default)
            
            let finalCls = `modern-section ${cleanCls} `;
            if (bgUrl) {
              finalCls += "modern-section--has-bg";
            } else if (dayBgColor && dayBgColor !== "transparent") {
              finalCls += `modern-section--${dayBgColor}`;
            } else {
              finalCls += (di % 2 === 0 ? "modern-section--tan" : "");
            }

            const finalStyle = { ...style, ...(bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {}) };

            if (dayStyle === "split") {
              return (
                <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                  <div className="modern-container">
                    <p className={`modern-subtitle modern-subtitle--center reveal ${isPrv ? "visible" : ""}`}>{day.label}</p>
                    {day.date && <p className={`modern-text modern-text--small text-center mb-10 reveal ${isPrv ? "visible" : ""}`}>{day.date}</p>}
                    <div className={`modern-grid modern-grid--2col reveal ${isPrv ? "visible" : ""}`} style={{ alignItems: "start" }}>
                      <div className="flex flex-col gap-6">
                        <h2 className="modern-title">The Venues</h2>
                        {day.venues.map(renderVenueCard)}
                      </div>
                      <div className="flex flex-col gap-6">
                        <h2 className="modern-title">Good to Know</h2>
                        {day.infoBlocks.map(renderInfoBlock)}
                      </div>
                    </div>
                    {day.note && <p className={`modern-text modern-text--small text-center mt-10 reveal ${isPrv ? "visible" : ""}`}>{day.note}</p>}
                  </div>
                </section>
              );
            }

            if (dayStyle === "minimal") {
              return (
                <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                  <div className="modern-container modern-container--narrow">
                    <p className={`modern-subtitle modern-subtitle--center reveal ${isPrv ? "visible" : ""}`}>{day.label}</p>
                    {day.date && <p className={`modern-text modern-text--small text-center mb-6 reveal ${isPrv ? "visible" : ""}`}>{day.date}</p>}
                    <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>Essential Information</h2>
                    <div className="modern-details-minimal">
                      {day.venues.map((v, i) => (
                        <div key={i} className={`modern-details-minimal__item reveal ${isPrv ? "visible" : ""}`}>
                          <div className="modern-details-minimal__label">{v.label}</div>
                          <div className="modern-details-minimal__main">
                            <h3 className="modern-details-minimal__name">{v.name}</h3>
                            <p className="modern-details-minimal__time">{v.time}</p>
                          </div>
                          <p className="modern-details-minimal__address">{v.address}</p>
                        </div>
                      ))}
                    </div>
                    {day.infoBlocks.length > 0 && (
                      <div className="mt-12 flex flex-col gap-8">
                        {day.infoBlocks.map(renderInfoBlock)}
                      </div>
                    )}
                    {day.note && <p className={`modern-text modern-text--small text-center mt-10 reveal ${isPrv ? "visible" : ""}`}>{day.note}</p>}
                  </div>
                </section>
              );
            }

            // Default: Grid
            return (
              <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                <div className="modern-container">
                  <p className={`modern-subtitle modern-subtitle--center reveal ${isPrv ? "visible" : ""}`}>{day.label}</p>
                  {day.date && <p className={`modern-text modern-text--small text-center mb-6 reveal ${isPrv ? "visible" : ""}`}>{day.date}</p>}
                  <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>The Details</h2>
                  <div className={`modern-grid modern-grid--3col reveal ${isPrv ? "visible" : ""}`}>
                    {day.venues.map(renderVenueCard)}
                    {day.infoBlocks.map(renderInfoBlock)}
                  </div>
                  {day.note && <p className={`modern-text modern-text--small text-center mt-10 reveal ${isPrv ? "visible" : ""}`}>{day.note}</p>}
                </div>
              </section>
            );
          })}
        </>
      );
    },

    day2: () => null, // Day 2 is now integrated into details (eventDays)

    schedule: (id, cls = "", style = {}) => {
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
            <div className="modern-timeline-minimal">
              {items.map((item, i) => (
                <div key={i} className={`modern-timeline-minimal__item reveal ${cls.includes("preview") ? "visible" : ""}`}>
                  <div className="modern-timeline-minimal__time">
                    {item.hour}<span>{item.period}</span>
                  </div>
                  <div className="modern-timeline-minimal__details">
                    <h3 className="modern-timeline-minimal__event">{item.event}</h3>
                    {item.venue && <span className="modern-timeline-minimal__venue">at {item.venue}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (scheduleStyle === "cards") {
          return (
            <div className="modern-timeline-cards">
              {items.map((item, i) => (
                <div key={i} className={`modern-timeline-card reveal ${cls.includes("preview") ? "visible" : ""}`}>
                  <div className="modern-timeline-card__time">{item.hour}<span>{item.period}</span></div>
                  <h3 className="modern-timeline-card__event">{item.event}</h3>
                  {item.venue && <p className="modern-timeline-card__venue">{item.venue}</p>}
                  {item.description && <p className="modern-timeline-card__desc">{item.description}</p>}
                </div>
              ))}
            </div>
          );
        }

        // Default: Modern Classic
        return (
          <div className="modern-schedule">
            {items.map((item, i) => (
              <div key={i} className={`modern-schedule__item reveal ${cls.includes("preview") ? "visible" : ""}`}>
                <div className="modern-schedule__time">
                  {item.hour}<span>{item.period}</span>
                </div>
                <div className="modern-schedule__info">
                  <h3 className="modern-schedule__event">{item.event}</h3>
                  {item.venue && <p className="modern-schedule__venue">{item.venue}</p>}
                  {item.description && <p className="modern-schedule__desc">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      };

      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className={`modern-container modern-container--narrow ${cls.includes("preview") ? "preview-mode" : ""}`}>
            <h2 className="modern-title modern-title--center reveal">Schedule</h2>
            
            {days.map((day, di) => (
              <div key={di} className={di > 0 ? "modern-schedule-day-gap" : ""}>
                {day.label && (
                  <div className="modern-schedule-day-header reveal">
                    <h3 className="modern-schedule-day-title">{day.label}</h3>
                    {day.date && <p className="modern-schedule-day-date">{day.date}</p>}
                  </div>
                )}
                {renderTimeline(day.items)}
              </div>
            ))}
          </div>
        </section>
      );
    },

    gallery: (id, cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id={id} style={style}>
        <div className="modern-container">
          <h2 className="modern-title reveal">Gallery</h2>
          <div className="modern-gallery reveal">
            {site.galleryImages.map((img, i) => (
              <img 
                key={i} 
                src={img.url} 
                alt={img.alt} 
                className="modern-gallery__img" 
                data-zoomable 
              />
            ))}
          </div>
        </div>
      </section>
    ),

    explore: (id, cls = "", style = {}) => {
      if (site.exploreGroups.length === 0) return null;
      const isPrv = cls.includes("preview");
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>Things to Do</h2>
            <div className="modern-grid modern-grid--3col">
              {site.exploreGroups.map((group, i) => (
                <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
                  <h3 className="modern-card__title">{group.heading}</h3>
                  {group.subheading && <p className="modern-card__text italic mb-4">{group.subheading}</p>}
                  <ul className="flex flex-col gap-2">
                    {group.links.map((link, j) => (
                      <li key={j}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="modern-link text-sm">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    accommodations: (id, cls = "", style = {}) => {
      if (site.accommodations.length === 0) return null;
      const isPrv = cls.includes("preview");
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>Where to Stay</h2>
            <div className="modern-grid modern-grid--2col">
              {site.accommodations.map((hotel, i) => (
                <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
                  {hotel.badge && <span className="modern-card__label">{hotel.badge}</span>}
                  <h3 className="modern-card__title">{hotel.name}</h3>
                  <p className="modern-card__label mb-4">{hotel.distance}</p>
                  <p className="modern-card__text mb-6">{hotel.description}</p>
                  {hotel.discountCode && (
                    <div className="mb-6 p-3 bg-black/5 rounded-sm border border-black/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Discount Code</p>
                      <p className="font-bold tracking-wider">{hotel.discountCode}</p>
                    </div>
                  )}
                  <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer" className="modern-btn modern-btn--primary text-center">
                    Book Your Stay
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    rsvp: (id, cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id={id} style={style}>
        <div className="modern-container modern-container--narrow">
          <div className="modern-card modern-card--flat reveal">
            <h2 className="modern-title modern-title--center">{site.rsvpHeading}</h2>
            <p className="modern-subtitle modern-subtitle--center">{site.rsvpDeadlineText}</p>
            <RSVPForm slug={site.slug} mealOptions={site.rsvpMealOptions} showHalalOption={site.showHalalOption ?? true} />
          </div>
        </div>
      </section>
    ),

    gift: (id, cls = "", style = {}) => {
      if (!site.giftHeading) return null;

      const paymentLinks = [...(site.giftPaymentLinks || [])];
      if (paymentLinks.length === 0 && site.giftPaymentUrl && site.giftPaymentLabel) {
        paymentLinks.push({ label: site.giftPaymentLabel, url: site.giftPaymentUrl });
      }

      const hasBankDetails = (site.giftBankDetails?.length ?? 0) > 0 || site.giftBankName || site.giftAccountNumber;
      const hasAnyGifts = paymentLinks.length > 0 || hasBankDetails;

      if (!hasAnyGifts) return null;

      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow reveal text-center">
            <h2 className="modern-title">{site.giftHeading}</h2>
            <p className="modern-text">{site.giftSubheading}</p>
            
            <div className="gift__dropdown-wrap">
              <div className="gift__dropdown">
                <button className="gift__dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                  Choose a Gift Method
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                
                <div className="gift__dropdown-menu">
                  {paymentLinks.map((link, i) => (
                    <a key={`link-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="gift__dropdown-item gift__dropdown-item--link">
                      <span className="gift__item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </span>
                      {link.label}
                    </a>
                  ))}

                  {site.giftBankDetails?.map((bank, i) => (
                    <div key={`bank-${i}`} className="gift__dropdown-item gift__dropdown-item--bank text-left">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="modern-text modern-text--small">{site.giftNote}</p>
          </div>
        </section>
      );
    },

    contact: (id, cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id={id} style={style}>
        <div className="modern-container reveal text-center">
          <h2 className="modern-title">{site.contactHeading || "Contact"}</h2>
          <div className="modern-contact-grid">
            {site.contactEntries.map((c, i) => (
              <div key={i} className="modern-contact-item">
                <a href={`mailto:${c.email}`} className="modern-link">{c.email}</a>
                {c.phone && <a href={`tel:${c.phone}`} className="modern-link">{c.phone}</a>}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    footer: (id, cls = "", style = {}) => (
      <footer className={`modern-footer ${cls}`} id={id} style={style}>
        <div className="modern-container">
          <div className="modern-footer__content">
            <p className="modern-footer__names">{site.footerNames}</p>
            <p className="modern-footer__copy">{site.footerCopyright}</p>
            {site.footerDevCredit && (
              <div className="modern-footer__dev" dangerouslySetInnerHTML={{ __html: site.footerDevCredit }} />
            )}
          </div>
        </div>
      </footer>
    ),
  };

  return (
    <div className="modern-site" style={themeVars}>
      <WeddingSiteClient 
        weddingDate={site.weddingDate} 
        scheduleStyle={site.scheduleStyle} 
        detailsStyle={site.detailsStyle}
        sectionOrder={site.sectionOrder}
      />
      
      <nav className="modern-nav">
        <div className="modern-container modern-nav__inner">
          <a href="#hero" className="modern-nav__brand">{site.navBrand}</a>
          <ul className="modern-nav__links">
            {navItems.map(item => (
              <li key={item.id}><a href={`#${item.id}`} className="modern-nav__link">{item.label}</a></li>
            ))}
          </ul>
        </div>
      </nav>

      {order.filter(s => s.visible).map((section, i) => {
        const render = sections[section.type] || sections[section.id];
        if (!render) return null;

        const bgUrl = site.sectionBackgrounds?.[section.id];
        const bgColor = site.sectionBackgroundColors?.[section.id];
        
        // Only apply alternating backgrounds to content sections (not hero or footer)
        const isContent = !['hero', 'footer'].includes(section.type);

        // SPECIAL CASE: Some sections (letter, menu) are dark by design.
        // If they don't have a custom background OR COLOR, we let them handle their own default.
        const isSelfStyling = ['letter', 'menu'].includes(section.type);
        
        // Background color logic:
        // 1. Image background (overrides everything)
        // 2. Explicitly selected background color
        // 3. Section default (self-styling)
        // 4. Alternating background (tan/default)
        
        let extraClass = "";
        if (bgUrl) {
          extraClass = "modern-section--has-bg";
        } else if (bgColor && bgColor !== "transparent") {
          extraClass = `modern-section--${bgColor}`;
        } else if (isContent && !isSelfStyling) {
          extraClass = (i % 2 === 0) ? "modern-section--tan" : "";
        }

        if (isPreview) extraClass += " preview";
        const extraStyle = bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {};

        return <div key={section.id}>{render(section.id, extraClass, extraStyle)}</div>;
      })}
    </div>
  );
}

export default ModernTemplate;
