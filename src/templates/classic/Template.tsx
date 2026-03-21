import SafeImage from "@/components/SafeImage";
import type { WeddingSite, VenueItem, VenueInfoBlock } from "@/lib/types/wedding-site";
import { getTheme, getFontStyle } from "@/lib/themes";
import { toEmbedUrl, generateThemeVars, getSectionData, getGoogleFontsUrl } from "@/lib/template-utils";
import WeddingSiteClient from "./WeddingSiteClient";
import CountdownClient from "@/templates/CountdownClient";
import RSVPForm from "@/components/RSVPForm";
import AccommodationActions from "@/components/AccommodationActions";
import GiftContributionForm from "@/components/GiftContributionForm";
import EditableText from "@/components/dashboard/EditableText";
import "./styles.css";

export function ClassicTemplate({ site, isPreview, onFieldUpdate }: { site: WeddingSite; isPreview?: boolean; onFieldUpdate?: (field: string, value: string) => void }) {
  const editable = !!onFieldUpdate;
  const E = ({ field, value, className, style, children, multiline }: { field: string; value: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode; multiline?: boolean }) => {
    if (!editable) return <>{children ?? value}</>;
    return <EditableText fieldKey={field} value={value} onUpdate={onFieldUpdate!} className={className} style={style} multiline={multiline}>{children ?? value}</EditableText>;
  };
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
            {d(id, 'pretext', site.heroPretext) && <p className="hero__pretext"><E field="heroPretext" value={d(id, 'pretext', site.heroPretext)} /></p>}
            <h1 className="hero__names">
              <E field="partner1Name" value={site.partner1Name} /> <span className="hero__ampersand">&amp;</span> <E field="partner2Name" value={site.partner2Name} />
            </h1>
            <div className="hero__line"></div>
            {d(id, 'tagline', site.heroTagline) && <p className="hero__tagline"><E field="heroTagline" value={d(id, 'tagline', site.heroTagline)} /></p>}
            {d(id, 'cta', site.heroCta) && <a href="#rsvp" className="hero__btn"><E field="heroCta" value={d(id, 'cta', site.heroCta)} /></a>}
            <p className="hero__date-line">
              <E field="dateDisplayText" value={site.dateDisplayText} /> &bull; <E field="locationText" value={site.locationText} />
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
              <p className="section__subtitle"><E field="storySubtitle" value={d(id, 'subtitle', site.storySubtitle)} /></p>
              <h2 className="section__title"><E field="storyTitle" value={d(id, 'title', site.storyTitle)} /></h2>
              <div className="section__line"></div>
            </div>
            <div className="story">
              <div className="story__text-block reveal">
                <p className="story__lead">&ldquo;<E field="storyLeadQuote" value={d(id, 'leadQuote', site.storyLeadQuote)} />&rdquo;</p>
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

            const sectionBaseStyle: React.CSSProperties = {
              ...style,
              position: 'relative',
              overflow: 'hidden',
              background: bgUrl ? 'var(--color-dark)' : undefined
            };

            const dayContent = (
              <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                {dayStyle === "split" ? (
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
                ) : dayStyle === "minimal" ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

    quote: (id, cls = "", style = {}) => {
      const text = d(id, 'text', site.quoteText);
      if (!text) return null;
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="quote reveal">
              <p className="quote__text">&ldquo;<E field="quoteText" value={text} />&rdquo;</p>
              {d(id, 'attribution', site.quoteAttribution) && (
                <p className="quote__attribution">&mdash; <E field="quoteAttribution" value={d(id, 'attribution', site.quoteAttribution)} /></p>
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
              {d(id, 'opening', site.letterOpening) && <p className="letter__opening"><E field="letterOpening" value={d(id, 'opening', site.letterOpening)} /></p>}
              {body.map((p, i) => (
                <p key={i} className="letter__text">{p}</p>
              ))}
              {d(id, 'closing', site.letterClosing) && <p className="letter__closing"><E field="letterClosing" value={d(id, 'closing', site.letterClosing)} /></p>}
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
      const hasBg = cls.includes("section--has-bg");
      const categories = site.menuCategories || [];
      const hasCategories = categories.length > 0;
      const hasContent = hasCategories || (site.menuItems && site.menuItems.length > 0);
      if (!hasContent && !hasBg) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`section ${cls}`} style={style}>
            <div className="container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Menu — no content yet</p>
            </div>
          </section>
        );
      }

      const renderDish = (item: { name: string; description: string }, i: number) => (
        <div key={i} className="menu__item">
          <div className="menu__item-name">{item.name}</div>
          <p className="menu__item-desc">
            {item.description.split("\n").map((line, j) => (
              <span key={j}>{line}{j < item.description.split("\n").length - 1 && <br />}</span>
            ))}
          </p>
        </div>
      );

      return (
        <section className={`section ${cls || "section--dark"}`} id={id} style={style}>
          <div className="container">
            <div className="menu-section reveal">
              <h2 className="menu__heading">Menu</h2>
              {hasCategories ? (
                categories.map((cat) => (
                  <div key={cat.id} className="menu__category">
                    {cat.name && <h3 className="menu__category-name">{cat.name}</h3>}
                    {cat.items.map((item, i) => renderDish(item, i))}
                  </div>
                ))
              ) : (
                (site.menuItems || []).map((item, i) => renderDish(item, i))
              )}
              {site.menuNote && <p className="menu__note">{site.menuNote}</p>}
            </div>
          </div>
        </section>
      );
    },

    faqs: (id, cls = "", style = {}) => {
      const hasBg = cls.includes("section--has-bg");
      const hasContent = site.faqs && site.faqs.length > 0;
      if (!hasContent && !hasBg) return null;

      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Information</p>
              <h2 className="section__title">{d(id, 'heading', site.faqHeading) || "Frequently Asked Questions"}</h2>
              <div className="section__line"></div>
            </div>
            <div className="faq-list reveal" style={{ maxWidth: '800px', margin: '0 auto' }}>
              {(site.faqs || []).map((faq, i) => (
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
      const hasBg = cls.includes("section--has-bg");
      const hasContent = site.exploreGroups && site.exploreGroups.length > 0;
      
      if (!hasContent && !hasBg) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`section ${cls}`} style={style}>
            <div className="container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Things to Do — no content yet</p>
            </div>
          </section>
        );
      }

      return (
        <div className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">While You&rsquo;re Here</p>
              <h2 className="section__title">Things to Do</h2>
              <div className="section__line"></div>
            </div>
            <div className="explore-grid">
             {(site.exploreGroups || []).map((group, i) => (
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
        </div>
      );
    },

    accommodations: (id, cls = "", style = {}) => {
      const hasBg = cls.includes("section--has-bg");
      const hasContent = site.accommodations && site.accommodations.length > 0;
      
      if (!hasContent && !hasBg) return null;

      return (
        <div className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="section__header reveal">
              <p className="section__subtitle">Where to Stay</p>
              <h2 className="section__title">Accommodations</h2>
              <div className="section__line"></div>
            </div>
            {site.accommodationNote && (
              <div className="hotel-card__note reveal">
                <p>{site.accommodationNote}</p>
              </div>
            )}
            <div className="hotels-grid">
              {(site.accommodations || []).map((hotel, i) => (
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
                  <AccommodationActions
                    phone={hotel.phone}
                    email={hotel.email}
                    bookingUrl={hotel.bookingUrl}
                    buttonLabel={hotel.buttonLabel}
                    variant="classic"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="rsvp__form-wrap reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <h2 className="rsvp__heading"><E field="rsvpHeading" value={site.rsvpHeading} /></h2>
              <p className="rsvp__subheading">{site.rsvpDeadlineText}</p>
              <RSVPForm slug={site.slug} mealOptions={mealOptions} mealDietaryOptions={mealDietaryOptions} calendarInfo={site.weddingDate ? { partner1Name: site.partner1Name, partner2Name: site.partner2Name, weddingDate: site.weddingDate, weddingEndDate: site.weddingEndDate, dateDisplayText: site.dateDisplayText, locationText: site.locationText, siteSlug: site.slug } : undefined} />
            </div>
          </div>
        </section>
      );
    },

    gift: (id, cls = "", style = {}) => {
      if (!site.giftHeading) return null;

      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="gift-section reveal">
              <h2 className="gift__heading"><E field="giftHeading" value={site.giftHeading} /></h2>
              <p className="gift__subheading"><E field="giftSubheading" value={site.giftSubheading} /></p>

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

              {site.giftNote && <p className="gift__note">{site.giftNote}</p>}
            </div>
          </div>
        </section>
      );
    },

    contact: (id, cls = "", style = {}) => {
      if (!site.contactEntries || site.contactEntries.length === 0) {
        if (!isPreview) return null;
        return (
          <section id={id} className={`section ${cls}`} style={style}>
            <div className="container" style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.35 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Contact — no content yet</p>
            </div>
          </section>
        );
      }
      return (
        <section className={`section ${cls}`} id={id} style={style}>
          <div className="container">
            <div className="contact-section reveal">
              <h2 className="contact__heading"><E field="contactHeading" value={site.contactHeading || "Get in Touch"} /></h2>
              {site.contactSubheading && <p className="contact__subheading"><E field="contactSubheading" value={site.contactSubheading} /></p>}
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
          <p className="footer__names"><E field="footerNames" value={site.footerNames} /></p>
          <p className="footer__date"><E field="footerDateText" value={site.footerDateText} /></p>
          <div className="footer__line"></div>
          <p className="footer__copy"><E field="footerCopyright" value={site.footerCopyright} /></p>
          <div className="footer__dev" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
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
        </footer>
      );
    },
  };

  return (
    <div className="wedding-site" style={themeVars}>
      {!isPreview && (
        <WeddingSiteClient
          weddingDate={site.weddingDate}
          scheduleStyle={site.scheduleStyle}
          sectionOrder={site.sectionOrder}
        />
      )}
      {site.weddingDate && (
        <CountdownClient weddingDate={site.weddingDate} />
      )}

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={getGoogleFontsUrl(site)} rel="stylesheet" />

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
        </>
      )}

      {/* Render sections in order */}
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
        // 4. Alternating background (accent/primary)
        
        let extraClass = "";
        if (bgUrl) {
          extraClass = `section--has-bg section--dark`;
        } else if (bgColor && bgColor !== "transparent") {
          extraClass = `section--${bgColor}`;
          if (bgColor === "dark") extraClass += " section--dark";
        } else if (isContent && !isSelfStyling) {
          extraClass = (i % 2 === 0) ? "section--accent" : "section--primary";
        }

        if (isPreview) extraClass += " preview";
        const extraStyle = {};

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
                {/* Desktop: absolute-positioned cover background */}
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
                {/* Mobile: block-level image that preserves aspect ratio */}
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

export default ClassicTemplate;
