import type { WeddingSite } from "@/lib/types/wedding-site";
import { getTheme } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import RSVPForm from "@/components/RSVPForm";
import "./styles.css";

export function ModernTemplate({ site }: { site: WeddingSite }) {
  const theme = getTheme(site.templateId);
  const themeVars = generateThemeVars(site.templateId);
  const { order, visibleSections, navItems } = getSectionData(site);

  const sections: Record<string, (cls?: string, style?: React.CSSProperties) => React.ReactNode> = {
    hero: (cls = "", style = {}) => (
      <header className={`modern-hero ${cls}`} style={style}>
        <div className="modern-hero__bg"></div>
        <div className="modern-container">
          <div className="modern-hero__content reveal">
            <p className="modern-hero__pretext">{site.heroPretext}</p>
            <h1 className="modern-hero__names">
              {site.partner1Name} <span className="modern-amp">&</span> {site.partner2Name}
            </h1>
            <p className="modern-hero__tagline">{site.heroTagline}</p>
            <div className="modern-hero__date-loc">
              <span className="modern-hero__date">{site.dateDisplayText}</span>
              <span className="modern-hero__sep">|</span>
              <span className="modern-hero__loc">{site.locationText}</span>
            </div>
            <a href="#rsvp" className="modern-btn modern-btn--primary">{site.heroCta}</a>
          </div>
        </div>
      </header>
    ),

    story: (cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id="story" style={style}>
        <div className="modern-container">
          <div className="modern-grid modern-grid--2col">
            <div className="modern-story__img-wrap reveal">
              <img src={site.storyImageUrl} alt={site.storyTitle} className="modern-story__img" />
            </div>
            <div className="modern-story__content reveal">
              <p className="modern-subtitle">{site.storySubtitle}</p>
              <h2 className="modern-title">{site.storyTitle}</h2>
              <blockquote className="modern-quote">{site.storyLeadQuote}</blockquote>
              <div className="modern-text">
                {site.storyBody.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    details: (cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id="details" style={style}>
        <div className="modern-container">
          <h2 className="modern-title modern-title--center reveal">The Details</h2>
          <div className="modern-grid modern-grid--3col reveal">
            {site.venues.map((venue, i) => (
              <div key={i} className="modern-card">
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
            ))}
            {site.venueInfoBlocks.map((block, i) => (
              <div key={i} className="modern-card">
                {block.heading && <h3 className="modern-card__title">{block.heading}</h3>}
                <p className="modern-card__text">{block.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    schedule: (cls = "", style = {}) => {
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
        <section className={`modern-section ${cls}`} id="schedule" style={style}>
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

    gallery: (cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id="gallery" style={style}>
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

    rsvp: (cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id="rsvp" style={style}>
        <div className="modern-container modern-container--narrow">
          <div className="modern-card modern-card--flat reveal">
            <h2 className="modern-title modern-title--center">{site.rsvpHeading}</h2>
            <p className="modern-subtitle modern-subtitle--center">{site.rsvpDeadlineText}</p>
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
        <section className={`modern-section ${cls}`} id="gift" style={style}>
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

    contact: (cls = "", style = {}) => (
      <section className={`modern-section ${cls}`} id="contact" style={style}>
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

    footer: (cls = "", style = {}) => (
      <footer className={`modern-footer ${cls}`} style={style}>
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
      <WeddingSiteClient weddingDate={site.weddingDate} scheduleStyle={site.scheduleStyle} />
      
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

      {order.map((section) => {
        if (!section.visible) return null;
        const render = sections[section.id];
        if (!render) return null;

        const bgUrl = site.sectionBackgrounds?.[section.id];
        const extraClass = bgUrl ? "modern-section--has-bg" : "";
        const extraStyle = bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {};

        return <div key={section.id}>{render(extraClass, extraStyle)}</div>;
      })}
    </div>
  );
}

export default ModernTemplate;
