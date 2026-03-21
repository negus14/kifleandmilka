import SafeImage from "@/components/SafeImage";
import type { WeddingSite, VenueItem, VenueInfoBlock, ScheduleItem } from "@/lib/types/wedding-site";
import { getTheme, getFontStyle } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData, getGoogleFontsUrl } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import CountdownClient from "@/templates/CountdownClient";
import RSVPForm from "@/components/RSVPForm";
import AccommodationActions from "@/components/AccommodationActions";
import GiftContributionForm from "@/components/GiftContributionForm";
import EditableText from "@/components/dashboard/EditableText";
import "./styles.css";

export function ModernTemplate({ site, isPreview, onFieldUpdate }: { site: WeddingSite; isPreview?: boolean; onFieldUpdate?: (field: string, value: string) => void }) {
  const editable = !!onFieldUpdate;
  const E = ({ field, value, className, style, children, multiline }: { field: string; value: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode; multiline?: boolean }) => {
    if (!editable) return <>{children ?? value}</>;
    return <EditableText fieldKey={field} value={value} onUpdate={onFieldUpdate!} className={className} style={style} multiline={multiline}>{children ?? value}</EditableText>;
  };
  const theme = getTheme(site.templateId);
  const fontStyle = getFontStyle(site.fontStyleId);
  const themeVars = generateThemeVars(site);
  const { order, visibleSections, navItems } = getSectionData(site);

  const d = <T,>(id: string, key: string, fallback: T): T => (site.sectionData?.[id]?.[key] as T) ?? fallback;

  const sections: Record<string, (id: string, cls?: string, style?: React.CSSProperties) => React.ReactNode> = {
    hero: (id, cls = "", style = {}) => {
      if (!site.partner1Name && !site.partner2Name) return null;
      return (
        <header className={`modern-hero ${cls}`} id={id} style={style}>
          {site.heroImageUrl && (
            <div className="modern-hero__bg">
              <SafeImage
                src={site.heroImageUrl}
                alt={`${site.partner1Name} & ${site.partner2Name}`}
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className="modern-container">
            <div className="modern-hero__content reveal">
              {d(id, 'pretext', site.heroPretext) && <p className="modern-hero__pretext"><E field="heroPretext" value={d(id, 'pretext', site.heroPretext)} /></p>}
              <h1 className="modern-hero__names">
                <E field="partner1Name" value={site.partner1Name} /> <span className="modern-amp">&</span> <E field="partner2Name" value={site.partner2Name} />
              </h1>
              {d(id, 'tagline', site.heroTagline) && <p className="modern-hero__tagline"><E field="heroTagline" value={d(id, 'tagline', site.heroTagline)} /></p>}
              <div className="modern-hero__date-loc">
                <span className="modern-hero__date"><E field="dateDisplayText" value={site.dateDisplayText} /></span>
                <span className="modern-hero__sep">|</span>
                <span className="modern-hero__loc"><E field="locationText" value={site.locationText} /></span>
              </div>
              {d(id, 'cta', site.heroCta) && <a href="#rsvp" className="modern-btn modern-btn--primary"><E field="heroCta" value={d(id, 'cta', site.heroCta)} /></a>}
            </div>
          </div>
        </header>
      );
    },

    story: (id, cls = "", style = {}) => {
      const body = d(id, 'body', site.storyBody);
      if (!body || body.length === 0 || (body.length === 1 && !body[0])) return null;
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <div className="modern-grid modern-grid--2col">
              <div className="modern-story__img-wrap reveal">
                <SafeImage 
                  src={d(id, 'imageUrl', site.storyImageUrl)} 
                  alt={d(id, 'title', site.storyTitle)} 
                  width={600}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="modern-story__img"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="modern-story__content reveal">
                {d(id, 'subtitle', site.storySubtitle) && <p className="modern-subtitle"><E field="storySubtitle" value={d(id, 'subtitle', site.storySubtitle)} /></p>}
                <h2 className="modern-title"><E field="storyTitle" value={d(id, 'title', site.storyTitle)} /></h2>
                {d(id, 'leadQuote', site.storyLeadQuote) && <blockquote className="modern-quote"><E field="storyLeadQuote" value={d(id, 'leadQuote', site.storyLeadQuote)} /></blockquote>}
                <div className="modern-text">
                  {body.map((p: string, i: number) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },

    quote: (id, cls = "", style = {}) => {
      const text = d(id, 'text', site.quoteText);
      if (!text) return null;
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow text-center reveal">
            <h2 className="modern-quote modern-quote--large">"<E field="quoteText" value={text} />"</h2>
            <p className="modern-quote-attr">— <E field="quoteAttribution" value={d(id, 'attribution', site.quoteAttribution)} /></p>
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
              <SafeImage 
                src={url} 
                alt="Featured" 
                width={1200}
                height={800}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="modern-featured-photo__img" 
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
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
              <p className="modern-letter__opening"><E field="letterOpening" value={opening} /></p>
              {d(id, 'body', site.letterBody).map((p: string, i: number) => (
                <p key={i} className="modern-letter__body">{p}</p>
              ))}
              <p className="modern-letter__closing"><E field="letterClosing" value={d(id, 'closing', site.letterClosing)} /></p>
            </div>
          </div>
        </section>
      );
    },

    menu: (id, cls = "", style = {}) => {
      const hasBg = cls.includes("modern-section--has-bg");
      const categories = site.menuCategories || [];
      const hasCategories = categories.length > 0;
      const hasContent = hasCategories || (site.menuItems && site.menuItems.length > 0);
      if (!hasContent && !hasBg) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`modern-section ${cls}`} style={style}>
            <div className="modern-container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Menu — no content yet</p>
            </div>
          </section>
        );
      }

      // If parent didn't provide a background (tan or has-bg), default to dark for the menu
      const finalCls = cls.includes('modern-section--tan') || cls.includes('modern-section--has-bg') ? cls : `modern-section--dark ${cls}`;

      const renderDish = (item: { name: string; description: string }, i: number) => (
        <div key={i} className="reveal">
          <h3 className="modern-card__title" style={{ fontSize: '1.4rem' }}>{item.name}</h3>
          <p className="modern-text--small">{item.description}</p>
        </div>
      );

      return (
        <section className={`modern-section ${finalCls}`} id={id} style={style}>
          <div className="modern-container text-center">
            <h2 className="modern-title reveal">Menu</h2>
            {hasCategories ? (
              categories.map((cat) => (
                <div key={cat.id} className="mb-12 last:mb-0">
                  {cat.name && <h3 className="modern-subtitle reveal" style={{ marginBottom: '2rem' }}>{cat.name}</h3>}
                  <div className="modern-grid modern-grid--3col">
                    {cat.items.map((item, i) => renderDish(item, i))}
                  </div>
                </div>
              ))
            ) : (
              <div className="modern-grid modern-grid--3col">
                {(site.menuItems || []).map((item, i) => renderDish(item, i))}
              </div>
            )}
            {site.menuNote && <p className="modern-text--small mt-12 italic reveal">{site.menuNote}</p>}
          </div>
        </section>
      );
    },

    faqs: (id, cls = "", style = {}) => {
      const hasBg = cls.includes("modern-section--has-bg");
      const hasContent = site.faqs && site.faqs.length > 0;
      if (!hasContent && !hasBg) return null;

      const isPrv = cls.includes("preview");

      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow">
            <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>
              {d(id, 'heading', site.faqHeading) || "Frequently Asked Questions"}
            </h2>
            <div className="flex flex-col gap-12 mt-16">
              {(site.faqs || []).map((faq, i) => (
                <div key={i} className={`reveal ${isPrv ? "visible" : ""}`}>
                  <h3 className="modern-card__title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    {faq.question}
                  </h3>
                  <div className="modern-text--small" style={{ opacity: 0.7, lineHeight: '1.7' }}>
                    {faq.answer.split('\n').map((line, j) => (
                      <p key={j} className={j < faq.answer.split('\n').length - 1 ? "mb-4" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

            // Background color logic:
            // 1. Image background (overrides everything)
            // 2. Explicitly selected background color for this DAY
            // 3. Fallback to the color selected for the main SECTION (from sidebar)
            // 4. Alternating background (tan/default)
            
            let finalCls = `modern-section `;
            if (bgUrl) {
              finalCls += "modern-section--has-bg modern-section--dark";
            } else if (dayBgColor && dayBgColor !== "transparent") {
              finalCls += `modern-section--${dayBgColor}`;
            } else if (cls.includes('modern-section--')) {
              // Use the class passed down from the main loop (user's sidebar selection)
              finalCls += cls;
            } else {
              finalCls += (di % 2 === 0 ? "modern-section--tan" : "");
            }

            const sectionBaseStyle: React.CSSProperties = {
              ...style,
              position: 'relative',
              overflow: 'hidden',
              background: bgUrl ? 'var(--color-dark)' : undefined
            };

            const dayContent = (
              <div className="modern-container" style={{ position: 'relative', zIndex: 2 }}>
                <p className={`modern-subtitle modern-subtitle--center reveal ${isPrv ? "visible" : ""}`}>{day.label}</p>
                {day.date && <p className={`modern-text modern-text--small text-center mb-10 reveal ${isPrv ? "visible" : ""}`}>{day.date}</p>}
                
                {dayStyle === "split" ? (
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
                ) : dayStyle === "minimal" ? (
                  <div className="modern-container modern-container--narrow p-0">
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
                  </div>
                ) : (
                  <>
                    <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>The Details</h2>
                    <div className={`modern-grid modern-grid--3col reveal ${isPrv ? "visible" : ""}`}>
                      {day.venues.map(renderVenueCard)}
                      {day.infoBlocks.map(renderInfoBlock)}
                    </div>
                  </>
                )}
                
                {day.note && <p className={`modern-text modern-text--small text-center mt-10 reveal ${isPrv ? "visible" : ""}`}>{day.note}</p>}
              </div>
            );

            return (
              <section key={day.id} id={di === 0 ? id : undefined} className={finalCls} style={sectionBaseStyle}>
                {bgUrl && (
                  <>
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }} className="section-bg-image section-bg-desktop">
                      <SafeImage
                        src={bgUrl}
                        alt=""
                        fill
                        quality={100}
                        priority
                        sizes="100vw"
                        style={{
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <div className="section-bg-mobile">
                      <SafeImage
                        src={bgUrl}
                        alt=""
                        width={1200}
                        height={800}
                        quality={100}
                        sizes="100vw"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1,
                      background: 'rgba(0, 0, 0, 0.55)',
                      pointerEvents: 'none'
                    }} />
                  </>
                )}
                {dayContent}
              </section>
            );
          })}
        </>
      );
    },

    schedule: (id, cls = "", style = {}) => {
      const days = site.weddingDays?.filter((d) => !d.isPrivate) || [];
      if (days.length === 0) return null;

      const renderTimeline = (items: ScheduleItem[]) => {
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
                <div style={(!site.scheduleStyle || site.scheduleStyle === "classic" || site.scheduleStyle === "cards") ? { marginTop: '4rem' } : {}}>
                  {renderTimeline(day.items)}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    },

    gallery: (id, cls = "", style = {}) => {
      if (!site.galleryImages || site.galleryImages.length === 0) return null;
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <h2 className="modern-title reveal">Gallery</h2>
            <div className="modern-gallery reveal">
              {site.galleryImages.map((img, i) => (
                <SafeImage 
                  key={i}
                  src={img.url} 
                  alt={img.alt || "Gallery Image"} 
                  width={400}
                  height={400}
                  sizes="(max-width: 640px) 50vw, 400px"
                  className="modern-gallery__img" 
                  style={{ objectFit: 'cover' }}
                  data-zoomable 
                />
              ))}
            </div>
          </div>
        </section>
      );
    },

    explore: (id, cls = "", style = {}) => {
      const hasBg = cls.includes("modern-section--has-bg");
      const hasContent = site.exploreGroups && site.exploreGroups.length > 0;
      
      if (!hasContent && !hasBg) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`modern-section ${cls}`} style={style}>
            <div className="modern-container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Things to Do — no content yet</p>
            </div>
          </section>
        );
      }

      const isPrv = cls.includes("preview");
      return (
        <section id={id} className={`modern-section ${cls}`} style={style}>
          <div className="modern-container">
            <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>Things to Do</h2>
            <div className="modern-grid modern-grid--3col">
              {(site.exploreGroups || []).map((group, i) => (
                <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
                  <h3 className="modern-card__title">{group.heading}</h3>
                  {group.subheading && <p className="modern-card__text italic mb-4">{group.subheading}</p>}
                  <ul className="flex flex-col gap-2 list-none p-0">
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
      const hasBg = cls.includes("modern-section--has-bg");
      const hasContent = site.accommodations && site.accommodations.length > 0;
      
      if (!hasContent && !hasBg) return null;
      
      const isPrv = cls.includes("preview");
      return (
        <section id={id} className={`modern-section ${cls}`} style={style}>
          <div className="modern-container">
            <h2 className={`modern-title modern-title--center reveal ${isPrv ? "visible" : ""}`}>Where to Stay</h2>
            {site.accommodationNote && (
              <div className={`modern-card__note reveal ${isPrv ? "visible" : ""}`}>
                <p>{site.accommodationNote}</p>
              </div>
            )}
            <div className="modern-grid modern-grid--2col">
              {(site.accommodations || []).map((hotel, i) => (
                <div key={i} className={`modern-card reveal ${isPrv ? "visible" : ""}`}>
                  <h3 className="modern-card__title">{hotel.name}</h3>
                  <p className="modern-card__label mb-4">{hotel.distance}</p>
                  <p className="modern-card__text mb-6">{hotel.description}</p>
                  {hotel.discountCode && (
                    <div className="mb-6 p-3 bg-black/5 rounded-sm border border-black/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Discount Code</p>
                      <p className="font-bold tracking-wider">{hotel.discountCode}</p>
                    </div>
                  )}
                  <AccommodationActions
                    phone={hotel.phone}
                    email={hotel.email}
                    bookingUrl={hotel.bookingUrl}
                    buttonLabel={hotel.buttonLabel}
                    variant="modern"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    rsvp: (id, cls = "", style = {}) => {
      if (!site.rsvpHeading) return null;
      const menuMeals = site.menuItems?.map(m => m.name) || [];
      const mealOptions = menuMeals.length > 0 ? menuMeals : site.rsvpMealOptions;
      const mealDietaryOptions: Record<string, string[]> = {};
      site.menuItems?.forEach(m => {
        if (m.dietaryOptions && m.dietaryOptions.length > 0) {
          mealDietaryOptions[m.name] = m.dietaryOptions;
        }
      });

      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow">
            <div className="modern-card modern-card--flat reveal">
              <h2 className="modern-title modern-title--center"><E field="rsvpHeading" value={site.rsvpHeading} /></h2>
              <p className="modern-subtitle modern-subtitle--center">{site.rsvpDeadlineText}</p>
              <RSVPForm slug={site.slug} mealOptions={mealOptions} mealDietaryOptions={mealDietaryOptions} calendarInfo={site.weddingDate ? { partner1Name: site.partner1Name, partner2Name: site.partner2Name, weddingDate: site.weddingDate, weddingEndDate: site.weddingEndDate, dateDisplayText: site.dateDisplayText, locationText: site.locationText, siteSlug: site.slug } : undefined} />
            </div>
          </div>
        </section>
      );
    },

    gift: (id, cls = "", style = {}) => {
      if (!site.giftHeading) return null;

      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container modern-container--narrow reveal text-center">
            <h2 className="modern-title"><E field="giftHeading" value={site.giftHeading} /></h2>
            <p className="modern-text"><E field="giftSubheading" value={site.giftSubheading} /></p>

            {(() => {
              const paymentLinks = site.giftPaymentLinks || [];
              const bankDetails = site.giftBankDetails || [];
              const giftItems = site.giftItems || [];
              const paymentOptions = [
                ...paymentLinks.map(l => ({ label: l.label, url: l.url, currencies: l.currencies })),
                ...bankDetails.filter(b => b.payLink).map(b => ({ label: b.label, url: b.payLink, currencies: b.currencies })),
              ];
              const displayBankDetails = bankDetails.filter(b => !b.payLink);
              return (
                <GiftContributionForm
                  slug={site.slug}
                  giftItems={site.giftEnableContributions ? giftItems : []}
                  currency={site.giftCurrency || "GBP"}
                  paymentOptions={paymentOptions}
                  bankDetails={displayBankDetails}
                  showName={site.giftShowName ?? false}
                />
              );
            })()}

            {site.giftNote && <p className="modern-text modern-text--small">{site.giftNote}</p>}
          </div>
        </section>
      );
    },

    contact: (id, cls = "", style = {}) => {
      if (!site.contactEntries || site.contactEntries.length === 0) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`modern-section ${cls}`} style={style}>
            <div className="modern-container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Contact — no content yet</p>
            </div>
          </section>
        );
      }
      return (
        <section className={`modern-section ${cls}`} id={id} style={style}>
          <div className="modern-container reveal text-center">
            <h2 className="modern-title"><E field="contactHeading" value={site.contactHeading || "Contact"} /></h2>
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
      );
    },

    footer: (id, cls = "", style = {}) => {
      const names = d(id, 'names', site.footerNames);
      if (!names) return null;
      return (
        <footer className={`modern-footer ${cls}`} id={id} style={style}>
          <div className="modern-container">
            <div className="modern-footer__content">
              <p className="modern-footer__names"><E field="footerNames" value={names} /></p>
              {d(id, 'date', site.footerDateText) && <p className="modern-footer__copy" style={{ marginTop: '0.25rem', opacity: 0.6 }}><E field="footerDateText" value={d(id, 'date', site.footerDateText)} /></p>}
              <p className="modern-footer__copy" style={{ marginTop: '1rem' }}><E field="footerCopyright" value={d(id, 'copy', site.footerCopyright)} /></p>
              <div className="modern-footer__dev" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <a href="https://github.com/abeallin" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ display: 'inline-flex', opacity: 0.4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="https://ko-fi.com/abeallin" target="_blank" rel="noopener noreferrer" aria-label="Ko-fi" style={{ display: 'inline-flex', opacity: 0.4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.681-4.011 3.681s-.065.064-.16.033c-.1-.033-.078-.13-.078-.13s-.513-1.304-.723-2.123c-.582-2.27.326-3.432 1.078-4.16.755-.733 1.524-1.261 1.914-2.072.39-.811.333-1.932-.333-2.503-.666-.57-1.893-.51-2.56.166-.667.676-.853 1.573-.853 1.573L5.68 6.775s.578-2.397 2.732-3.171c2.153-.774 4.17.11 4.833 1.335.666 1.225.49 3.168-.426 4.52z" />
                  </svg>
                </a>
                <a href="mailto:abelghebz@gmail.com" aria-label="Email" style={{ display: 'inline-flex', opacity: 0.4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13 2 4" />
                  </svg>
                </a>
                <a href="https://wa.me/447527841324" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ display: 'inline-flex', opacity: 0.4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      );
    },
  };

  return (
    <div className="modern-site" style={themeVars}>
      {site.weddingDate && (
        <CountdownClient weddingDate={site.weddingDate} />
      )}
      {!isPreview && (
        <>
          {/* Lightbox */}
          <div className="lightbox" id="lightbox">
            <button className="lightbox__close" aria-label="Close">&times;</button>
            <button className="lightbox__nav lightbox__nav--prev" id="lightbox-prev" aria-label="Previous">&#8249;</button>
            <img className="lightbox__img" id="lightbox-img" alt="" />
            <button className="lightbox__nav lightbox__nav--next" id="lightbox-next" aria-label="Next">&#8250;</button>
            <span className="lightbox__counter" id="lightbox-counter"></span>
          </div>

          <WeddingSiteClient
            weddingDate={site.weddingDate}
            scheduleStyle={site.scheduleStyle}
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
        </>
      )}

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={getGoogleFontsUrl(site)} rel="stylesheet" />

      {order.filter(s => s.visible).map((section, i) => {
        const render = sections[section.type] || sections[section.id];
        if (!render) return null;

        const bgUrl = site.sectionBackgrounds?.[section.id];
        const bgColor = site.sectionBackgroundColors?.[section.id];
        const textColorOverride = site.sectionTextColors?.[section.id];
        const sectionId = section.id.toLowerCase();
        
        // Only apply alternating backgrounds to content sections (not hero)
        const isContent = section.type !== 'hero';

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
          extraClass = "modern-section--has-bg modern-section--dark";
        } else if (bgColor && bgColor !== "transparent") {
          extraClass = `modern-section--${bgColor}`;
        } else if (isContent && !isSelfStyling) {
          extraClass = (i % 2 === 0) ? "modern-section--tan" : "";
        }

        if (isPreview) extraClass += " preview";
        const extraStyle = {}; // Reset style as we use Image component for backgrounds

        return (
          <div
            key={section.id}
            className={extraClass}
            style={{
              position: 'relative',
              zIndex: order.length - i,
              background: bgUrl ? 'var(--color-dark)' : 'transparent',
              overflow: 'hidden',
              ...(bgUrl && textColorOverride ? { '--color-primary': textColorOverride, '--color-accent': textColorOverride } as React.CSSProperties : {}),
            }}
          >
            {bgUrl && (
              <>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }} className="section-bg-image section-bg-desktop">
                  <SafeImage
                    src={bgUrl}
                    alt=""
                    fill
                    quality={100}
                    priority
                    sizes="100vw"
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div className="section-bg-mobile">
                  <SafeImage
                    src={bgUrl}
                    alt=""
                    width={1200}
                    height={800}
                    quality={100}
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  background: 'rgba(0, 0, 0, 0.55)',
                  pointerEvents: 'none'
                }} />
              </>
            )}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {render(section.id, "", {})}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ModernTemplate;
