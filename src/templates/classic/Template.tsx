import SafeImage from "@/components/SafeImage";
import type { WeddingSite, VenueItem, VenueInfoBlock } from "@/lib/types/wedding-site";
import { getTheme, getFontStyle } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import RSVPForm from "@/components/RSVPForm";
import "./styles.css";

export function ClassicTemplate({ site, isPreview }: { site: WeddingSite; isPreview?: boolean }) {
  const theme = getTheme(site.templateId);
  const fontStyle = getFontStyle(site.fontStyleId);
  const themeVars = generateThemeVars(site);
  const { order, visibleSections, navItems } = getSectionData(site);

  // Section renderers
  const d = <T,>(id: string, key: string, fallback: T): T => (site.sectionData?.[id]?.[key] as T) ?? fallback;

  const sections: Record<string, (id: string, cls?: string, style?: React.CSSProperties) => React.ReactNode> = {
    hero: (id, cls = "", style = {}) => {
      if (!site.partner1Name && !site.partner2Name) return null;
      return (
        <section className={`hero ${cls}`} id={id} style={style}>
          <div className="hero__bg" style={{ position: 'absolute', inset: 0 }}>
            {site.heroImageUrl && (
              <SafeImage 
                src={site.heroImageUrl} 
                alt="" 
                fill 
                priority 
                sizes="100vw"
                style={{ objectFit: 'cover' }} 
              />
            )}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, color-mix(in srgb, var(--color-dark), transparent 75%) 0%, color-mix(in srgb, var(--color-dark), transparent 60%) 100%)`,
            }}></div>
          </div>
          <div className="hero__content" style={{ position: 'relative', zIndex: 1 }}>
            {d(id, 'pretext', site.heroPretext) && <p className="hero__pretext">{d(id, 'pretext', site.heroPretext)}</p>}
            <h1 className="hero__names">
              {site.partner1Name} <span className="hero__ampersand">&amp;</span> {site.partner2Name}
            </h1>
            <div className="hero__line"></div>
            {d(id, 'tagline', site.heroTagline) && <p className="hero__tagline">{d(id, 'tagline', site.heroTagline)}</p>}
            {d(id, 'cta', site.heroCta) && <a href="#rsvp" className="hero__btn">{d(id, 'cta', site.heroCta)}</a>}
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
      );
    },

    story: (id, cls = "", style = {}) => {
      const storyBody = d(id, 'body', site.storyBody);
      if (!storyBody || storyBody.length === 0 || (storyBody.length === 1 && !storyBody[0])) return null;

      return (
        <section className={`section ${cls || "section--tan"}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">{d(id, 'subtitle', site.storySubtitle)}</p>
              <h2 className="section__title">{d(id, 'title', site.storyTitle)}</h2>
              <div className="section__line"></div>
            </div>
            <div className="story">
              <div className="story__text-block reveal">
                <p className="story__lead">&ldquo;{d(id, 'leadQuote', site.storyLeadQuote)}&rdquo;</p>
                {storyBody.map((p, i) => (
                  <p key={i} className="story__text">{p}</p>
                ))}
              </div>
              <div className="story__img reveal reveal-delay-1">
                <SafeImage
                  src={d(id, 'imageUrl', site.storyImageUrl)}
                  alt={`${site.partner1Name} and ${site.partner2Name}`}
                  width={600}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="story__img"
                  style={{ objectFit: 'cover' }}
                  data-zoomable
                />
              </div>
            </div>
          </div>
        </section>
      );
    },

    details: (id, cls = "", style = {}) => {
      if (!site.eventDays || site.eventDays.length === 0) return null;

      const renderVenueCard = (venue: VenueItem, i: number) => (
        <div key={i} className="info-card reveal">
          <p className="info-card__label">{venue.label}</p>
          <h3 className="info-card__name">{venue.name}</h3>
          <p className="info-card__text">{venue.address.split("\n").map((l, j) => <span key={j}>{l}<br/></span>)}</p>
          <p className="info-card__time">{venue.time}</p>
          {venue.mapsEmbedUrl && (
            <iframe 
              src={toEmbedUrl(venue.mapsEmbedUrl)} 
              className="info-card__map" 
              loading="lazy" 
              title={`${venue.label} location map`}
            />
          )}
        </div>
      );

      const renderInfoBlock = (block: VenueInfoBlock, i: number) => (
        <div key={i} className="info-card reveal">
          {block.heading && <h3 className="info-card__title">{block.heading}</h3>}
          {block.subheading && <h4 className="info-card__label">{block.subheading}</h4>}
          <p className="info-card__text">{block.text}</p>
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
            // 4. Alternating background (tan/cream)
            
            let finalCls = `section `;
            if (bgUrl) {
              finalCls += "section--has-bg section--dark";
            } else if (dayBgColor && dayBgColor !== "transparent") {
              finalCls += `section--${dayBgColor}`;
              if (dayBgColor === "dark") finalCls += " section--dark";
            } else if (cls.includes('section--')) {
              // Use the class passed down from the main loop (user's sidebar selection)
              finalCls += cls;
            } else {
              finalCls += (di % 2 === 0 ? "section--tan" : "section--cream");
            }

            const finalStyle = { ...style, ...(bgUrl ? { backgroundImage: `url('${bgUrl}')` } : {}) };

            if (dayStyle === "split") {
              return (
                <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                  <div className="container">
                    <div className="details-split-layout">
                      <div className="details-split__venues">
                        {day.venues.map(renderVenueCard)}
                      </div>
                      <div className="details-split__info">
                        <div className="section__header reveal" style={{ textAlign: "left", marginBottom: "2rem" }}>
                          <p className="section__subtitle">{day.label}</p>
                          {day.date && <p className="section__date">{day.date}</p>}
                          <h2 className="section__title">Essential Info</h2>
                          <div className="section__line" style={{ margin: "1.25rem 0 0" }}></div>
                        </div>
                        {day.infoBlocks.map(renderInfoBlock)}
                        {day.note && <p className="info-block__text mt-8" style={{ fontStyle: "italic", opacity: 0.8 }}>{day.note}</p>}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            if (dayStyle === "minimal") {
              return (
                <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                  <div className="container">
                    <div className="section__header reveal">
                      <p className="section__subtitle">{day.label}</p>
                      {day.date && <p className="section__date text-center mb-4">{day.date}</p>}
                      <h2 className="section__title">Wedding Details</h2>
                      <div className="section__line"></div>
                    </div>
                    <div className="details-minimal">
                      {day.venues.map((v, i) => (
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
                    {day.infoBlocks.length > 0 && (
                      <div className="details-minimal__info reveal">
                        {day.infoBlocks.map(renderInfoBlock)}
                      </div>
                    )}
                    {day.note && <p className="text-center mt-10 opacity-70 italic">{day.note}</p>}
                  </div>
                </section>
              );
            }

            // Default: Grid
            return (
              <section key={day.id} id={id} className={finalCls} style={finalStyle}>
                <div className="container">
                  <div className="section__header reveal">
                    <p className="section__subtitle">{day.label}</p>
                    {day.date && <p className="section__date text-center mb-4">{day.date}</p>}
                    <h2 className="section__title">Wedding Details</h2>
                    <div className="section__line"></div>
                  </div>
                  <div className="info-grid">
                    {day.venues.map(renderVenueCard)}
                  </div>
                  {day.infoBlocks.length > 0 && (
                    <div className="details-split reveal">
                      {day.infoBlocks.map(renderInfoBlock)}
                    </div>
                  )}
                  {day.note && <p className="text-center mt-10 opacity-70 italic">{day.note}</p>}
                </div>
              </section>
            );
          })}
        </>
      );
    },

    quote: (id, cls = "", style = {}) => {
      const text = d(id, 'text', site.quoteText);
      if (!text) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="quote reveal">
              <p className="quote__text">&ldquo;{text}&rdquo;</p>
              {d(id, 'attribution', site.quoteAttribution) && (
                <p className="quote__attribution">&mdash; {d(id, 'attribution', site.quoteAttribution)}</p>
              )}
            </div>
          </div>
        </section>
      );
    },

    featuredPhoto: (id, cls = "", style = {}) => {
      const url = d(id, 'url', site.featuredPhotoUrl);
      if (!url) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="featured-photo reveal">
              <SafeImage 
                src={url} 
                alt="Featured" 
                width={1200}
                height={800}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="featured-photo__img" 
                style={{ objectFit: 'cover' }}
                data-zoomable 
              />
              {d(id, 'caption', site.featuredPhotoCaption) && (
                <p className="featured-photo__caption">{d(id, 'caption', site.featuredPhotoCaption)}</p>
              )}
            </div>
          </div>
        </section>
      );
    },

    letter: (id, cls = "", style = {}) => {
      const body = d(id, 'body', site.letterBody);
      if (!body || body.length === 0 || (body.length === 1 && !body[0])) return null;
      return (
        <section className={`section ${cls || "section--dark"}`} id={id} style={style}>
          <div className="container">
            <div className="letter reveal">
              {d(id, 'opening', site.letterOpening) && <p className="letter__opening">{d(id, 'opening', site.letterOpening)}</p>}
              {body.map((p, i) => (
                <p key={i} className="letter__text">{p}</p>
              ))}
              {d(id, 'closing', site.letterClosing) && <p className="letter__closing">{d(id, 'closing', site.letterClosing)}</p>}
            </div>
          </div>
        </section>
      );
    },

    loveletter: (id, cls = "", style = {}) => sections.letter(id, cls, style),

    schedule: (id, cls = "", style = {}) => {
      const days = site.weddingDays?.filter((d) => !d.isPrivate) || [];
      if (days.length === 0) return null;

      // Map dashboard styles to classic template styles
      const dashboardStyle = site.scheduleStyle || "classic";
      const scheduleStyle = dashboardStyle === "minimal" ? "minimal" : 
                            dashboardStyle === "cards" ? "cards" : "timeline";

      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Plan</p>
              <h2 className="section__title">Our Schedule</h2>
              <div className="section__line"></div>
            </div>

            {days.map((day, di) => (
              <div key={di} className={di > 0 ? "mt-32" : ""}>
                {day.label && (
                  <div className="text-center mb-20 reveal">
                    <h3 className="text-3xl font-serif italic text-[#2d2b25]/80">{day.label}</h3>
                    {day.date && <p className="text-sm opacity-50 mt-2 uppercase tracking-[0.3em]">{day.date}</p>}
                  </div>
                )}

                {scheduleStyle === "timeline" && (
                  <div className="timeline" style={{ marginTop: '4rem' }}>
                    {day.items.map((item, i) => (
                      <div key={i} className="timeline__item reveal">
                        <div className="timeline__hour">
                          {item.hour}<span>{item.period}</span>
                        </div>
                        <div className="timeline__content">
                          <h3 className="timeline__event">{item.event}</h3>
                          <p className="timeline__venue">{item.venue}</p>
                          {item.description && <p className="timeline__desc">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {scheduleStyle === "minimal" && (
                  <div className="timeline-minimal">
                    {day.items.map((item, i) => (
                      <div key={i} className="timeline-minimal__item reveal">
                        <div className="timeline-minimal__time">{item.hour}{item.period}</div>
                        <div className="timeline-minimal__event">{item.event}</div>
                        <div className="timeline-minimal__venue">{item.venue}</div>
                      </div>
                    ))}
                  </div>
                )}

                {scheduleStyle === "cards" && (
                  <div className="timeline-cards" style={{ marginTop: '4rem' }}>
                    {day.items.map((item, i) => (
                      <div key={i} className="timeline-card reveal">
                        <div className="timeline-card__time">{item.hour}{item.period}</div>
                        <h3 className="timeline-card__event">{item.event}</h3>
                        <div className="timeline-card__line" style={{ width: '30px', height: '1px', background: 'currentColor', margin: '1rem auto', opacity: 0.2 }}></div>
                        <p className="timeline-card__venue">{item.venue}</p>
                        {item.description && <p className="timeline-card__desc">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    },

    menu: (id, cls = "", style = {}) => {
      if (!site.menuItems || site.menuItems.length === 0) return null;
      return (
        <section className={`section ${cls || "section--dark"}`} id={id} style={style}>
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

    faqs: (id, cls = "", style = {}) => {
      if (!site.faqs || site.faqs.length === 0) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Information</p>
              <h2 className="section__title">{d(id, 'heading', site.faqHeading) || "Frequently Asked Questions"}</h2>
              <div className="section__line"></div>
            </div>
            <div className="faq-list reveal" style={{ maxWidth: '800px', margin: '0 auto' }}>
              {site.faqs.map((faq, i) => (
                <div key={i} className="faq-item" style={{ marginBottom: '3rem' }}>
                  <h3 className="faq-question" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-dark)' }}>
                    {faq.question}
                  </h3>
                  <div className="faq-answer" style={{ fontSize: '1rem', lineHeight: '1.8', opacity: 0.8, color: 'var(--color-dark)' }}>
                    {faq.answer.split('\n').map((line, j) => (
                      <p key={j} style={{ marginBottom: j < faq.answer.split('\n').length - 1 ? '1rem' : 0 }}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    gallery: (id, cls = "", style = {}) => {
      if (!site.galleryImages || site.galleryImages.length === 0) return null;
      const isCustomBg = !!site.sectionBackgrounds?.[id];
      // Only use gallery-dark default if no explicit palette or image is set
      const isPaletteBg = cls.includes('section--tan') || cls.includes('section--cream') || cls.includes('section--dark');
      const finalCls = (!isCustomBg && !isPaletteBg) ? `${cls} gallery-dark section--dark` : cls;
      const showDarkBg = (!isCustomBg && !isPaletteBg);

      return (
        <section className={`section ${finalCls}`} id={id} style={style}>
          {showDarkBg && <div className="gallery-dark__bg"></div>}
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Moments</p>
              <h2 className="section__title">Our Gallery</h2>
              <div className="section__line"></div>
            </div>
            <div className="gallery-float reveal">
              {site.galleryImages.map((img, i) => (
                <div key={i} className="gallery-float__img-wrap">
                  <SafeImage
                    src={img.url}
                    alt={img.alt || "Gallery Image"}
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    style={{ objectFit: 'cover' }}
                    className="gallery-float__img"
                    data-zoomable
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    explore: (id, cls = "", style = {}) => {
      if (!site.exploreGroups || site.exploreGroups.length === 0) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">While You&rsquo;re Here</p>
              <h2 className="section__title">Things to Do</h2>
              <div className="section__line"></div>
            </div>
            <div className="explore-grid">
             {site.exploreGroups.map((group, i) => (
               <div key={i} className={`explore-card reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
                 <h3 className="explore-col__heading">{group.heading}</h3>
                 <ul className="explore-col__list">                    {group.links.map((link, j) => (
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

    accommodations: (id, cls = "", style = {}) => {
      if (!site.accommodations || site.accommodations.length === 0) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Where to Stay</p>
              <h2 className="section__title">Accommodations</h2>
              <div className="section__line"></div>
            </div>
            <div className="hotels-grid">
              {site.accommodations.map((hotel, i) => (
                <div key={i} className={`hotel-card reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
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

    rsvp: (id, cls = "", style = {}) => {
      if (!site.rsvpHeading) return null;
      const menuMeals = site.menuItems?.map(m => m.name) || [];
      const mealOptions = menuMeals.length > 0 ? menuMeals : site.rsvpMealOptions;
      
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="rsvp__form-wrap reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <h2 className="rsvp__heading">{site.rsvpHeading}</h2>
              <p className="rsvp__subheading">{site.rsvpDeadlineText}</p>
              <RSVPForm slug={site.slug} mealOptions={mealOptions} showHalalOption={site.showHalalOption ?? true} />
            </div>
          </div>
        </section>
      );
    },

    gift: (id, cls = "", style = {}) => {
      const paymentLinks = [...(site.giftPaymentLinks || [])];
      if (paymentLinks.length === 0 && site.giftPaymentUrl && site.giftPaymentLabel) {
        paymentLinks.push({ label: site.giftPaymentLabel, url: site.giftPaymentUrl });
      }

      const hasBankDetails = (site.giftBankDetails?.length ?? 0) > 0 || site.giftBankName || site.giftAccountNumber;
      const hasAnyGifts = paymentLinks.length > 0 || hasBankDetails;

      if (!hasAnyGifts || !site.giftHeading) return null;

      return (
        <section className={`section ${cls}`} id={id} style={style}>
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
                    {site.giftBankDetails?.map((bank, i) => {
                      const allDetails = [
                        bank.accountHolder ? `Account Holder: ${bank.accountHolder}` : null,
                        bank.email ? `Email: ${bank.email}` : null,
                        bank.sortCode ? `Sort Code: ${bank.sortCode}` : null,
                        bank.accountNumber ? `Account Number: ${bank.accountNumber}` : null,
                        bank.swiftCode ? `SWIFT Code: ${bank.swiftCode}` : null,
                      ].filter(Boolean).join('\n');

                      return (
                        <div key={`bank-${i}`} className="gift__dropdown-item gift__dropdown-item--bank">
                          <div className="gift__bank-header">
                            <span className="gift__item-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            </span>
                            {bank.label}
                            <div className="gift__bank-actions">
                              {bank.payLink && (
                                <a 
                                  href={bank.payLink} 
                                  target="_blank" 
                                  rel="noopener" 
                                  className="bank-copy-btn bank-copy-btn--pay"
                                >
                                  Pay Now
                                </a>
                              )}
                              <button 
                                className="bank-copy-btn bank-copy-btn--all" 
                                data-copy={allDetails} 
                                title="Copy all details"
                              >
                                Copy All
                              </button>
                            </div>
                          </div>
                          <div className="gift__bank-details-mini">
                            {bank.accountHolder && <div className="gift__mini-row"><span>Holder:</span> <strong>{bank.accountHolder}</strong></div>}
                            {bank.email && (
                              <div className="gift__mini-row">
                                <span>Email:</span> 
                                <strong>{bank.email}</strong>
                              </div>
                            )}
                            {bank.sortCode && (
                              <div className="gift__mini-row">
                                <span>Sort:</span> 
                                <strong>{bank.sortCode}</strong>
                              </div>
                            )}
                            {bank.accountNumber && (
                              <div className="gift__mini-row">
                                <span>Account:</span> 
                                <strong>{bank.accountNumber}</strong>
                              </div>
                            )}
                            {bank.swiftCode && (
                              <div className="gift__mini-row">
                                <span>SWIFT:</span> 
                                <strong>{bank.swiftCode}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="gift__note">{site.giftNote}</p>
            </div>
          </div>
        </section>
      );
    },

    contact: (id, cls = "", style = {}) => {
      if (!site.contactEntries || site.contactEntries.length === 0) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
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

    footer: (id, cls = "", style = {}) => {
      if (!site.footerNames) return null;
      return (
        <footer className={`footer ${cls}`} id="footer" style={style}>
          <p className="footer__names">{site.footerNames}</p>
          <p className="footer__date">{site.footerDateText}</p>
          <div className="footer__line"></div>
          <p className="footer__copy">{site.footerCopyright}</p>
          {site.footerDevCredit && (
            <div className="footer__dev" dangerouslySetInnerHTML={{ __html: site.footerDevCredit }} />
          )}
        </footer>
      );
    },
  };

  return (
    <div className="wedding-site" style={themeVars}>
      <WeddingSiteClient 
        weddingDate={site.weddingDate} 
        scheduleStyle={site.scheduleStyle} 
        detailsStyle={site.detailsStyle}
        sectionOrder={site.sectionOrder}
      />

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontStyle.googleFontsUrl} rel="stylesheet" />

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
      {order.filter(s => s.visible).map((section, i) => {
        const render = sections[section.type] || sections[section.id];
        if (!render) return null;

        const bgUrl = site.sectionBackgrounds?.[section.id];
        const bgColor = site.sectionBackgroundColors?.[section.id];
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
        // 4. Alternating background (accent/primary)
        
        let extraClass = "";
        if (bgUrl) {
          extraClass = "section--has-bg section--dark";
        } else if (bgColor && bgColor !== "transparent") {
          extraClass = `section--${bgColor}`;
          if (bgColor === "dark") extraClass += " section--dark";
        } else if (isContent && !isSelfStyling) {
          extraClass = (i % 2 === 0) ? "section--accent" : "section--primary";
        }

        if (isPreview) extraClass += " preview";
        const extraStyle = {};

        return (
          <div key={section.id} style={{ position: 'relative', zIndex: order.length - i }}>
            {bgUrl && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <SafeImage 
                  src={bgUrl} 
                  alt="" 
                  fill 
                  sizes="100vw"
                  style={{ objectFit: 'cover' }} 
                />
              </div>
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {render(section.id, extraClass, extraStyle)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ClassicTemplate;
