import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";

type PackageName = "Starter" | "Growth" | "Enterprise" | "Custom";

type ApplicationForm = {
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  selectedService: string;
  selectedPackage: PackageName | "";
  projectDescription: string;
  requiredPages: string;
  budgetRange: string;
  preferredStartDate: string;
  expectedCompletionDate: string;
  consent: boolean;
  honeypot: string;
};

type AdminApplication = {
  id?: string;
  reference?: string;
  createdAt?: string;
  clientName?: string;
  contactPerson?: string;
  email?: string;
  selectedService?: string;
  selectedPackage?: string;
  projectDescription?: string;
  status?: string;
};

const STORY_FILM_SRC = "https://raw.githubusercontent.com/gardencitytechdiraj-bot/garden-city-tech/main/public/assets/mount-everest-himalayas-in-nepal-2026-01-22-22-57-24-utc.mp4";

const services = [
  {
    number: "01",
    title: "Website Development",
    description: "Fast, responsive websites shaped around your goals, content, and customers.",
    detail: "We can help you plan, design, and launch a fast, accessible website that makes your next stage easier to reach.",
    icon: "✦",
  },
  {
    number: "02",
    title: "UI/UX Design",
    description: "Clear, useful interfaces that make digital experiences easier to understand and use.",
    detail: "We turn complex journeys into clear flows, thoughtful interfaces, and practical systems your team can keep using.",
    icon: "⌁",
  },
  {
    number: "03",
    title: "Mobile App Development",
    description: "Thoughtful mobile products that help people do more wherever they are.",
    detail: "From early product thinking to a dependable release, we build mobile experiences around how people actually use them.",
    icon: "◌",
  },
  {
    number: "04",
    title: "SEO and Digital Marketing",
    description: "Practical strategies that improve discoverability and help the right audience find you.",
    detail: "We connect useful content, technical foundations, and measurable campaigns so the right people can find your work.",
    icon: "+",
  },
  {
    number: "05",
    title: "Brand Strategy",
    description: "A focused brand direction that gives your business a clearer, more consistent voice.",
    detail: "We help clarify what you stand for and translate that direction into a brand people can recognize and trust.",
    icon: "⌘",
  },
  {
    number: "06",
    title: "Digital Consulting",
    description: "Experienced guidance for technology decisions, priorities, and digital change.",
    detail: "Bring us the knotty decision, competing priorities, or next big move; we will help make a sensible path forward.",
    icon: "＋",
  },
] as const;

const packages: Array<{
  name: PackageName;
  eyebrow: string;
  description: string;
  idealFor: string;
  recommended?: boolean;
  points: string[];
}> = [
  {
    name: "Starter",
    eyebrow: "A focused first step",
    description: "Basic website/app development, fixed scope and limited support.",
    idealFor: "A clear, contained first release",
    points: ["Basic website/app development", "Fixed scope", "Limited support"],
  },
  {
    name: "Growth",
    eyebrow: "Build with momentum",
    description: "Custom development, UI/UX design, QA testing, maintenance, photo/video production and 3D animation.",
    idealFor: "Teams ready to grow a digital product",
    recommended: true,
    points: ["Custom development", "UI/UX design and QA testing", "Maintenance, photo/video production, and 3D animation"],
  },
  {
    name: "Enterprise",
    eyebrow: "A dedicated capability",
    description: "Dedicated team, project management, priority support, security reviews and ongoing enhancements.",
    idealFor: "Organizations with a long-term roadmap",
    points: ["Dedicated team", "Project management and priority support", "Security reviews and ongoing enhancements"],
  },
  {
    name: "Custom",
    eyebrow: "Make the brief your own",
    description: "A flexible solution based on the client’s requirements.",
    idealFor: "A brief that needs its own shape",
    points: ["A tailored scope", "Flexible service mix", "Requirements-led planning"],
  },
];

const processSteps = [
  ["01", "Discover", "We start with your context, constraints, and the change you want to make."],
  ["02", "Plan", "We turn the brief into a shared direction, scope, and sensible next step."],
  ["03", "Design", "We make the experience legible through thoughtful flows, systems, and prototypes."],
  ["04", "Develop", "We develop with care, communicating clearly as the product takes shape."],
  ["05", "Test", "We test, tune, and prepare the work for a confident handover or launch."],
  ["06", "Launch and support", "We stay available for the next iteration, improvement, or new chapter."],
] as const;

const initialForm: ApplicationForm = {
  clientName: "",
  contactPerson: "",
  email: "",
  phone: "",
  country: "",
  website: "",
  selectedService: "",
  selectedPackage: "",
  projectDescription: "",
  requiredPages: "",
  budgetRange: "",
  preferredStartDate: "",
  expectedCompletionDate: "",
  consent: false,
  honeypot: "",
};

const fieldIds: Record<keyof ApplicationForm, string> = {
  clientName: "client-name",
  contactPerson: "contact-person",
  email: "email",
  phone: "phone",
  country: "country",
  website: "existing-website",
  selectedService: "selected-service",
  selectedPackage: "selected-package",
  projectDescription: "project-description",
  requiredPages: "required-pages",
  budgetRange: "budget-range",
  preferredStartDate: "preferred-start-date",
  expectedCompletionDate: "expected-completion-date",
  consent: "consent",
  honeypot: "honeypot",
};

const acceptedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
];
const acceptedFileExtensions = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".zip"];
const maxFileSize = 4 * 1024 * 1024;

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  if (currentPath === "/admin") {
    return <AdminPanel onBack={() => navigate("/")} />;
  }

  return <HomePage onNavigate={navigate} />;
}

function HomePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageName | undefined>();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isStoryFilmOpen, setIsStoryFilmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [headerCondensed, setHeaderCondensed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const storyFilmTriggerRef = useRef<HTMLButtonElement>(null);
  const storyFilmDialogRef = useRef<HTMLDivElement>(null);
  const wasMenuOpen = useRef(false);
  const wasStoryFilmOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setHeaderCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "services", "about", "packages", "contact"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visibleSection) setActiveSection(visibleSection.target.id);
    }, { rootMargin: "-25% 0px -55%", threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && wasMenuOpen.current) menuButtonRef.current?.focus();
    wasMenuOpen.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (!isStoryFilmOpen) return;
    const closeButton = storyFilmDialogRef.current?.querySelector<HTMLButtonElement>(".video-modal-close");
    closeButton?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsStoryFilmOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isStoryFilmOpen]);

  useEffect(() => {
    if (!isStoryFilmOpen && wasStoryFilmOpen.current) storyFilmTriggerRef.current?.focus();
    wasStoryFilmOpen.current = isStoryFilmOpen;
  }, [isStoryFilmOpen]);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (["home", "services", "about", "packages", "contact"].includes(id)) setActiveSection(id);
    if (id === "main-content") target?.focus({ preventScroll: true });
    setMenuOpen(false);
  };

  const openApplication = (packageName?: PackageName) => {
    setSelectedPackage(packageName);
    setIsApplicationOpen(true);
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById("application")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const closeStoryFilm = () => setIsStoryFilmOpen(false);
  const selectedServiceDetails = services.find((service) => service.title === selectedService);
  const navButtonClass = (section: string) => activeSection === section ? "nav-active" : undefined;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={`site-header${headerCondensed ? " is-condensed" : ""}`}>
        <div className="container header-inner">
          <button className="brand-lockup" type="button" onClick={() => scrollTo("home")} aria-label="Garden City Tech home">
            <img className="brand-logo" src="/assets/gc-logo-secondary.png" alt="Garden City Tech" width="960" height="455" />
            <img className="brand-icon" src="/assets/gc-logo-secondary.png" alt="Garden City Tech" width="960" height="455" />
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            ref={menuButtonRef}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
          </button>
          <nav id="primary-navigation" className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label="Primary navigation">
            <button className={navButtonClass("home")} aria-current={activeSection === "home" ? "page" : undefined} type="button" onClick={() => scrollTo("home")}>Home</button>
            <button className={navButtonClass("services")} aria-current={activeSection === "services" ? "page" : undefined} type="button" onClick={() => scrollTo("services")}>Services</button>
            <button className={navButtonClass("about")} aria-current={activeSection === "about" ? "page" : undefined} type="button" onClick={() => scrollTo("about")}>About</button>
            <button className={navButtonClass("packages")} aria-current={activeSection === "packages" ? "page" : undefined} type="button" onClick={() => scrollTo("packages")}>Packages</button>
            <button className="nav-apply" type="button" onClick={() => openApplication()}>Apply for Service</button>
            <button className={navButtonClass("contact")} aria-current={activeSection === "contact" ? "page" : undefined} type="button" onClick={() => scrollTo("contact")}>Contact</button>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section id="home" className="hero-section hero-light section-light" aria-labelledby="hero-heading">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="overline overline-lime">Rooted in Nepal · building for the world</p>
              <h1 id="hero-heading">Technology that <em>grows</em> with you.</h1>
              <p className="hero-intro">We design and build thoughtful digital products for people and organizations ready for their next chapter.</p>
              <div className="hero-actions">
                <button className="button button-lime" type="button" onClick={() => openApplication()}>Start a conversation</button>
                <button className="text-button light-button" type="button" onClick={() => scrollTo("services")}>Explore services <span aria-hidden="true">+</span></button>
              </div>
            </div>
            <div className="hero-visual" aria-label="Garden City Tech story film">
              <div className="video-placeholder">
                <video className="video-preview" src={STORY_FILM_SRC} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                <div className="video-grid-lines" aria-hidden="true" />
                <div className="video-label"><span className="status-dot" /> A glimpse of what’s possible</div>
                <MagneticPlayButton buttonRef={storyFilmTriggerRef} onActivate={() => setIsStoryFilmOpen(true)} />
                <span className="video-caption">Story film · 10 seconds</span>
              </div>
            </div>
          </div>
          <div className="container hero-footnote"><span>01 / 06</span><span className="hero-rule" /><span>Scroll to grow</span></div>
        </section>

        <section className="intro-section section-light" aria-labelledby="intro-heading">
          <div className="container intro-grid">
            <p className="overline">A better kind of technology partner</p>
            <div>
              <h2 id="intro-heading">Good technology is built by good <em>thinking.</em></h2>
              <p className="large-copy">Garden City Tech brings design, engineering, and long-term care together to turn ambitious ideas into dependable digital experiences.</p>
              <button className="arrow-link" type="button" onClick={() => scrollTo("about")}>Meet the thinking behind the work</button>
            </div>
          </div>
        </section>

        <section id="services" className="services-section section-mint" aria-labelledby="services-heading">
          <div className="container">
            <div className="section-heading split-heading">
              <div><p className="overline">What we do</p><h2 id="services-heading">Six ways to move<br /><em>forward.</em></h2></div>
              <p>From the first sketch to the systems that keep a product healthy, we build with the whole journey in mind.</p>
            </div>
            <div className="service-grid">
              {services.map((service) => <button className={`service-card${selectedService === service.title ? " is-expanded" : ""}`} type="button" key={service.number} aria-expanded={selectedService === service.title} aria-controls="service-detail" onClick={() => setSelectedService((current) => current === service.title ? null : service.title)}>
                <div className="service-card-top"><span className="service-number">{service.number}</span><span className="service-icon" aria-hidden="true">{service.icon}</span></div>
                <h3>{service.title}</h3><p>{service.description}</p>
              </button>)}
            </div>
            {selectedServiceDetails && <section id="service-detail" className="service-detail" aria-labelledby="service-detail-heading" aria-live="polite"><p className="overline">Selected service</p><h3 id="service-detail-heading">{selectedServiceDetails.title}</h3><p>{selectedServiceDetails.detail}</p><button className="arrow-link" type="button" onClick={() => openApplication()} >Start a conversation</button></section>}
          </div>
        </section>

        <section className="why-section section-dark" aria-labelledby="why-heading">
          <div className="container why-grid">
            <div className="why-stamp" aria-hidden="true"><img src="/assets/gc-logo-secondary.png" alt="" width="960" height="455" /><span>GCT / 2026</span></div>
            <div><p className="overline overline-lime">Why choose us</p><h2 id="why-heading">Small enough to <em>listen.</em><br />Skilled enough to deliver.</h2><p className="large-copy light-copy">We pair the attentiveness of a close partner with the discipline of a capable product team. Clear communication is part of the work, not an afterthought.</p>
              <div className="why-list"><div><span>01</span><p>People-first collaboration</p></div><div><span>02</span><p>Purposeful, practical innovation</p></div><div><span>03</span><p>Care beyond launch</p></div></div>
            </div>
          </div>
        </section>

        <section className="proof-section section-light" aria-labelledby="proof-heading">
          <div className="container proof-layout">
            <div className="section-heading"><p className="overline">Evidence, not noise</p><h2 id="proof-heading">Clarity you can <em>see.</em></h2><p className="large-copy">We keep the work understandable from the first conversation to the handover. You will always know what is being decided, tested, and prepared next.</p></div>
            <div className="proof-grid"><article><span>01</span><h3>Brief in plain language</h3><p>Goals, constraints, and priorities become a shared plan before production begins.</p></article><article><span>02</span><h3>Prototype before polish</h3><p>Important flows get shaped early, so decisions are visible while they are still easy to improve.</p></article><article><span>03</span><h3>Handover with care</h3><p>Launch includes practical documentation and a clear path for continued support.</p></article></div>
          </div>
        </section>

        <section className="process-section section-light" aria-labelledby="process-heading">
          <div className="container"><div className="section-heading split-heading"><div><p className="overline">How we work</p><h2 id="process-heading">A clear path from <em>idea</em> to impact.</h2></div><p>Six steps, shared openly. The right amount of structure to keep good work moving.</p></div>
            <ol className="process-list">{processSteps.map(([number, title, description]) => <li key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
          </div>
        </section>

        <section id="packages" className="packages-section section-mint" aria-labelledby="packages-heading">
          <div className="container"><div className="section-heading package-heading"><p className="overline">Ways to begin</p><h2 id="packages-heading">Find your starting <em>point.</em></h2><p>No two organizations are alike. These packages are conversation starters, shaped to flex around the work.</p></div>
            <div className="package-grid">{packages.map((pack) => <article className={`package-card${pack.recommended ? " is-recommended" : ""}`} key={pack.name}>{pack.recommended && <span className="package-recommended">Recommended</span>}<p className="package-eyebrow">{pack.eyebrow}</p><p className="package-ideal">Best for: {pack.idealFor}</p><h3>{pack.name}</h3><p>{pack.description}</p><ul>{pack.points.map((point) => <li key={point}><span aria-hidden="true">+</span>{point}</li>)}</ul><button className={`button ${pack.recommended ? "button-lime" : "button-outline"}`} type="button" onClick={() => openApplication(pack.name)}>Choose this package</button></article>)}</div>
          </div>
        </section>

        <section id="about" className="about-section section-light" aria-labelledby="about-heading">
          <div className="container about-grid"><div><p className="overline">01 — Foundations</p><h2 id="about-heading">Rooted here.<br /><em>Ready for anywhere.</em></h2><p className="large-copy">Garden City Tech is a software development and technology company creating digital solutions that help businesses innovate, grow, and make a lasting impact.</p></div>
            <div className="values-stack"><div className="manifesto-card card-vision"><p className="overline">Vision</p><p>To be a globally trusted technology partner, recognized for delivering innovative solutions while empowering people to creatively impact future generations.</p></div><div className="manifesto-card card-mission"><p className="overline">Mission</p><p>To build technology and provide long-term support that helps businesses innovate, grow, and turn their vision into reality through collaboration, integrity, and technical excellence.</p></div><div className="values-card"><p className="overline">Values we bring</p><div className="value-tags"><span>People first</span><span>Innovation with purpose</span><span>Excellence</span><span>Integrity</span><span>Collaboration</span><span>Continuous learning</span><span>Communication</span></div></div></div>
          </div>
        </section>

        {isApplicationOpen && <ApplicationSection selectedPackage={selectedPackage} onClose={() => setIsApplicationOpen(false)} />}

        <section id="contact" className="cta-section section-dark" aria-labelledby="cta-heading"><div className="cta-logo-mark" aria-hidden="true"><img src="/assets/gc-logo-icon.png" alt="" width="180" height="180" /></div><div className="container cta-content"><p className="overline overline-lime">Your next chapter starts here</p><h2 id="cta-heading">Let’s grow<br /><em>something good.</em></h2><p>Tell us where you’re headed. We’ll bring curiosity, clarity, and the technical care to help you get there.</p><button className="button button-lime" type="button" onClick={() => openApplication()}>Apply for service</button></div></section>
      </main>

      {isStoryFilmOpen && <div className="video-modal" onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => { if (event.key === "Escape") closeStoryFilm(); }}>
        <button className="video-modal-backdrop" type="button" aria-label="Close story film dialog" onClick={closeStoryFilm} />
        <div className="video-modal-dialog" ref={storyFilmDialogRef} role="dialog" aria-modal="true" aria-labelledby="story-film-heading" aria-describedby="story-film-description">
          <button className="video-modal-close" type="button" onClick={closeStoryFilm} aria-label="Close story film dialog">×</button>
          <p className="overline overline-lime">Story film</p>
          <h2 id="story-film-heading">A glimpse of <em>what’s possible.</em></h2>
          <p id="story-film-description" className="video-modal-note" role="status">A short view from Nepal, made to show where thoughtful technology can take you.</p>
          <video className="story-film-video" src={STORY_FILM_SRC} controls autoPlay playsInline preload="metadata" aria-label="Garden City Tech story film video">
            Your browser does not support embedded video. <a href={STORY_FILM_SRC}>Watch the story film</a>.
          </video>
          <button className="button button-lime" type="button" onClick={closeStoryFilm}>Close video</button>
        </div>
      </div>}

      <footer className="site-footer"><div className="container footer-grid"><div><img className="footer-logo" src="/assets/gc-logo-secondary.png" alt="Garden City Tech" width="960" height="455" /><p>Rooted in Nepal. Building technology for the world.</p></div><div className="footer-nav"><p className="overline">Explore</p><button type="button" onClick={() => scrollTo("services")}>Services</button><button type="button" onClick={() => scrollTo("about")}>About</button><button type="button" onClick={() => scrollTo("packages")}>Packages</button></div><div className="footer-nav"><p className="overline">Start here</p><button type="button" onClick={() => openApplication()}>Apply for service</button><button type="button" onClick={() => scrollTo("contact")}>Contact</button><button className="admin-link" type="button" onClick={() => onNavigate("/admin")}>Admin access</button></div></div><div className="container footer-bottom"><span>© 2026 Garden City Tech Pvt. Ltd.</span><span>Technology that grows with you.</span></div></footer>
    </div>
  );
}

function MagneticPlayButton({ buttonRef, onActivate }: { buttonRef?: Ref<HTMLButtonElement>; onActivate: () => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const button = event.currentTarget.querySelector<HTMLButtonElement>(".magnetic-play");
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const distanceX = event.clientX - (bounds.left + bounds.width / 2);
    const distanceY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(distanceX, distanceY);
    const radius = Math.max(150, bounds.width * 1.5);
    if (distance > radius) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    const strength = Math.max(0, 1 - distance / radius);
    setOffset({ x: distanceX * 0.12 * strength, y: distanceY * 0.12 * strength });
  };

  return <div className="play-control-layer" onPointerMove={handlePointerMove} onPointerLeave={() => setOffset({ x: 0, y: 0 })}><button ref={buttonRef} className="magnetic-play" type="button" aria-label="Play the Garden City Tech story film" style={reducedMotion ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` }} onClick={onActivate}><span className="play-triangle" aria-hidden="true" /></button></div>;
}

function ApplicationSection({ selectedPackage, onClose }: { selectedPackage?: PackageName; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>({ ...initialForm, selectedPackage: selectedPackage ?? "" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "failure">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => { setForm((current) => ({ ...current, selectedPackage: selectedPackage ?? "" })); }, [selectedPackage]);

  const updateField = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => current.filter((invalidField) => invalidField !== fieldIds[field]));
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFileError("");
    if (!selectedFile) { setFile(null); return; }
    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if ((!acceptedFileTypes.includes(selectedFile.type) && !acceptedFileExtensions.includes(extension)) || selectedFile.size > maxFileSize) {
      setFile(null);
      setFileError(selectedFile.size > maxFileSize ? "That file is larger than 4 MB. Please choose a smaller file." : "Please upload a PDF, DOC, DOCX, PNG, JPG, or ZIP file.");
      event.target.value = "";
      return;
    }
    setFile(selectedFile);
  };

  const validateStep = (currentStep: number) => {
    setFieldError("");
    setInvalidFields([]);
    const failValidation = (message: string, fields: string[]) => {
      setFieldError(message);
      setInvalidFields(fields);
      window.setTimeout(() => document.getElementById(fields[0])?.focus(), 0);
      return false;
    };
    if (currentStep === 1) {
      const missingFields = [
        !form.clientName.trim() && "client-name",
        !form.contactPerson.trim() && "contact-person",
        !form.email.trim() && "email",
        !form.phone.trim() && "phone",
        !form.country.trim() && "country",
      ].filter((field): field is string => Boolean(field));
      if (missingFields.length) return failValidation("Please complete your organization, contact person, email, phone, and country before continuing.", missingFields);
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return failValidation("Please enter a valid email address.", ["email"]);
    }
    if (currentStep === 2) {
      const missingFields = [
        !form.selectedService && "selected-service",
        !form.selectedPackage && "selected-package",
      ].filter((field): field is string => Boolean(field));
      if (missingFields.length) return failValidation("Please choose a service and a starting package.", missingFields);
    }
    if (currentStep === 3) {
      const missingFields = [
        !form.projectDescription.trim() && "project-description",
        !form.requiredPages.trim() && "required-pages",
        !form.budgetRange.trim() && "budget-range",
        !form.preferredStartDate && "preferred-start-date",
        !form.expectedCompletionDate && "expected-completion-date",
      ].filter((field): field is string => Boolean(field));
      if (missingFields.length) return failValidation("Please complete the project description, required pages or features, budget range, and timeline before continuing.", missingFields);
      if (form.website && !/^https?:\/\//i.test(form.website.trim())) return failValidation("Existing website URL must start with http:// or https://.", ["existing-website"]);
    }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep((current) => Math.min(current + 1, 4)); };
  const previousStep = () => { setFieldError(""); setStep((current) => Math.max(current - 1, 1)); };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(4) || !form.consent) {
      if (!form.consent) {
        setFieldError("Please agree to be contacted about this application.");
        setInvalidFields(["consent"]);
        window.setTimeout(() => document.getElementById("consent")?.focus(), 0);
      } else {
        setFieldError("Please review the required fields.");
      }
      return;
    }
    setSubmitState("loading"); setSubmitMessage("");
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
    if (file) payload.append("attachment", file);
    try {
      const response = await fetch("/api/applications", { method: "POST", body: payload });
      const responseText = await response.text();
      let data: { reference?: string; error?: string } = {};
      try {
        data = responseText ? JSON.parse(responseText) as { reference?: string; error?: string } : {};
      } catch {
        if (response.status === 413 || /request entity too large|payload too large/i.test(responseText)) {
          throw new Error("That attachment is too large for the hosted form. Please choose a file smaller than 4 MB.");
        }
        throw new Error("The application service returned an unexpected response. Please try again in a moment.");
      }
      if (!response.ok) throw new Error(data.error || "Application request failed");
      setSubmitState("success");
      setSubmitMessage(data.reference ? `Your reference number is ${data.reference}. Keep it for your records.` : "Thank you. Your application is on its way to our team.");
    } catch (error) {
      setSubmitState("failure");
      setSubmitMessage(error instanceof Error ? error.message : "We couldn’t send your application right now. Please try again in a moment.");
    }
  };

  const isInvalid = (field: string) => invalidFields.includes(field);

  if (submitState === "success") return <section id="application" className="application-section section-dark" aria-live="polite"><div className="container application-result"><span className="result-mark">✓</span><p className="overline overline-lime">Application received</p><h2>We’ll be in <em>touch.</em></h2><p>{submitMessage}</p><button className="button button-lime" type="button" onClick={onClose}>Back to the site <span aria-hidden="true">↗</span></button></div></section>;

  return <section id="application" className="application-section section-dark" aria-labelledby="application-heading"><div className="container"><div className="application-top"><div><p className="overline overline-lime">Apply for service</p><h2 id="application-heading">Let’s make a good<br /><em>plan together.</em></h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Close application form">×</button></div><div className="form-layout"><div className="form-sidebar"><p>Application / 0{step}</p><div className="progress-rail" aria-label={`Step ${step} of 4`}><span style={{ height: `${step * 25}%` }} /></div><ol>{["About you", "The brief", "The details", "Review & send"].map((label, index) => <li className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol><p className="form-note">We only use your information to understand the work and respond to your application.</p></div>
          <form className="application-form" onSubmit={submitApplication} noValidate><div className="honeypot" aria-hidden="true"><label htmlFor="honeypot">Website</label><input id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" aria-describedby="honeypot-description" value={form.honeypot} onChange={(event) => updateField("honeypot", event.target.value)} /><span id="honeypot-description" className="sr-only">Leave this field empty.</span></div>
            {step === 1 && <fieldset><legend>Tell us about you</legend><p className="fieldset-intro">A few basics are enough to start.</p><div className="field-grid"><Field id="client-name" name="clientName" label="Client or organization name" required invalid={isInvalid("client-name")} value={form.clientName} onChange={(value) => updateField("clientName", value)} autoComplete="organization" /><Field id="contact-person" name="contactPerson" label="Contact person" required invalid={isInvalid("contact-person")} value={form.contactPerson} onChange={(value) => updateField("contactPerson", value)} autoComplete="name" /><Field id="email" name="email" label="Email address" required invalid={isInvalid("email")} type="email" value={form.email} onChange={(value) => updateField("email", value)} autoComplete="email" /><Field id="phone" name="phone" label="Phone number" required invalid={isInvalid("phone")} type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} autoComplete="tel" /><Field id="country" name="country" label="Country" required invalid={isInvalid("country")} value={form.country} onChange={(value) => updateField("country", value)} autoComplete="country-name" /></div></fieldset>}
            {step === 2 && <fieldset><legend>Shape the brief</legend><p className="fieldset-intro">Choose the path that feels closest. We’ll refine it together.</p><div className="field-grid"><label className="field wide" htmlFor="selected-service"><span id="selected-service-label">Selected service <b aria-hidden="true">*</b></span><select id="selected-service" name="selectedService" required aria-invalid={isInvalid("selected-service")} aria-describedby="selected-service-description" aria-labelledby="selected-service-label" value={form.selectedService} onChange={(event) => updateField("selectedService", event.target.value)}><option value="">Select a service</option>{services.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}</select><span id="selected-service-description" className="sr-only">Required. Choose the service you want to discuss.</span></label><label className="field wide" htmlFor="selected-package"><span id="selected-package-label">Selected package <b aria-hidden="true">*</b></span><select id="selected-package" name="selectedPackage" required aria-invalid={isInvalid("selected-package")} aria-describedby="selected-package-description" aria-labelledby="selected-package-label" value={form.selectedPackage} onChange={(event) => updateField("selectedPackage", event.target.value as PackageName)}><option value="">Select a package</option>{packages.map((pack) => <option key={pack.name} value={pack.name}>{pack.name} — {pack.eyebrow}</option>)}</select><span id="selected-package-description" className="sr-only">Required. Choose a starting package.</span></label></div></fieldset>}
            {step === 3 && <fieldset><legend>Give us the details</legend><p className="fieldset-intro">The more context you share, the more useful our first response can be.</p><label className="field wide" htmlFor="project-description"><span id="project-description-label">Project description <b aria-hidden="true">*</b></span><textarea id="project-description" name="projectDescription" rows={5} required aria-invalid={isInvalid("project-description")} aria-describedby="project-description-description" aria-labelledby="project-description-label" value={form.projectDescription} onChange={(event) => updateField("projectDescription", event.target.value)} placeholder="What are you hoping to create, improve, or change?" /><span id="project-description-description" className="sr-only">Required. Describe what you are hoping to create, improve, or change.</span></label><label className="field wide" htmlFor="required-pages"><span id="required-pages-label">Required pages or features <b aria-hidden="true">*</b></span><textarea id="required-pages" name="requiredPages" rows={3} required aria-invalid={isInvalid("required-pages")} aria-describedby="required-pages-description" aria-labelledby="required-pages-label" value={form.requiredPages} onChange={(event) => updateField("requiredPages", event.target.value)} placeholder="Which pages, features, or capabilities should we plan for?" /><span id="required-pages-description" className="sr-only">Required. List the pages, features, or capabilities to plan for.</span></label><div className="field-grid"><Field id="existing-website" name="website" label="Existing website URL" invalid={isInvalid("existing-website")} value={form.website} onChange={(value) => updateField("website", value)} type="url" /><label className="field" htmlFor="budget-range"><span id="budget-range-label">Budget range <b aria-hidden="true">*</b></span><select id="budget-range" name="budgetRange" required aria-invalid={isInvalid("budget-range")} aria-describedby="budget-range-description" aria-labelledby="budget-range-label" value={form.budgetRange} onChange={(event) => updateField("budgetRange", event.target.value)}><option value="">Select an option</option><option>Not sure yet</option><option>To discuss</option><option>I’ll share a range after our first conversation</option></select><span id="budget-range-description" className="sr-only">Required. Choose the budget range that best fits.</span></label><Field id="preferred-start-date" name="preferredStartDate" label="Preferred start date" required invalid={isInvalid("preferred-start-date")} type="date" value={form.preferredStartDate} onChange={(value) => updateField("preferredStartDate", value)} /><Field id="expected-completion-date" name="expectedCompletionDate" label="Expected completion date" required invalid={isInvalid("expected-completion-date")} type="date" value={form.expectedCompletionDate} onChange={(value) => updateField("expectedCompletionDate", value)} /></div></fieldset>}
            {step === 4 && <fieldset><legend>Review & send</legend><p className="fieldset-intro">One last thing: attach a useful brief or reference if you have one.</p><label className="file-drop" htmlFor="application-attachment"><span className="file-icon" aria-hidden="true">↥</span><span><strong>{file ? file.name : "Upload a brief or reference"}</strong><small>PDF, DOC, DOCX, PNG, JPG, or ZIP · max 4 MB</small></span><input id="application-attachment" name="attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" aria-invalid={Boolean(fileError)} aria-describedby={fileError ? "attachment-description attachment-error" : "attachment-description"} onChange={onFileChange} /><span id="attachment-description" className="sr-only">Optional. PDF, DOC, DOCX, PNG, JPG, or ZIP, maximum 4 MB.</span></label>{fileError && <p id="attachment-error" className="form-error" role="alert">{fileError}</p>}<div className="review-card"><div><span>Organization</span><strong>{form.clientName || "—"}</strong></div><div><span>Service</span><strong>{form.selectedService || "—"}</strong></div><div><span>Package</span><strong>{form.selectedPackage || "—"}</strong></div><div><span>Email</span><strong>{form.email || "—"}</strong></div></div><label className="consent-check" htmlFor="consent"><input id="consent" name="consent" type="checkbox" required aria-invalid={isInvalid("consent")} aria-describedby="consent-description" checked={form.consent} onChange={(event) => updateField("consent", event.target.checked)} /><span>I agree to be contacted by Garden City Tech about this application.</span><span id="consent-description" className="sr-only">Required. Agree to be contacted about this application.</span></label></fieldset>}
            {fieldError && <p id="application-error" className="form-error" role="alert">{fieldError}</p>}{submitState === "failure" && <p id="submission-error" className="form-error" role="alert">{submitMessage}</p>}<div className="form-actions">{step > 1 && <button className="text-button light-button" type="button" onClick={previousStep}>← Back</button>}{step < 4 ? <button className="button button-lime" type="button" onClick={nextStep}>Continue <span aria-hidden="true">→</span></button> : <button className="button button-lime" type="submit" disabled={submitState === "loading"}>{submitState === "loading" ? "Sending…" : "Send application ↗"}</button>}</div>
          </form></div></div></section>;
}

function Field({ id, name, label, value, onChange, type = "text", required = false, wide = false, autoComplete, invalid = false }: { id: string; name: string; label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; wide?: boolean; autoComplete?: string; invalid?: boolean }) {
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  return <label className={`field${wide ? " wide" : ""}`} htmlFor={id}><span id={labelId}>{label} {required && <b aria-hidden="true">*</b>}</span><input id={id} name={name} type={type} value={value} required={required} aria-invalid={invalid} aria-describedby={descriptionId} aria-labelledby={labelId} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} />{invalid && <span id={descriptionId} className="field-error" role="alert">Please complete this field.</span>}</label>;
}

function AdminPanel({ onBack }: { onBack: () => void }) {
  const [accessKey, setAccessKey] = useState("");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "failure">("idle");
  const [message, setMessage] = useState("Enter the access key to view submitted applications.");

  const loadApplications = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/applications", { headers: { "x-admin-key": accessKey } });
      if (!response.ok) throw new Error("Unable to load applications");
      const data: unknown = await response.json();
      const rows = Array.isArray(data) ? data : (typeof data === "object" && data !== null && "applications" in data && Array.isArray(data.applications) ? data.applications : []);
      setApplications(rows as AdminApplication[]); setStatus("success"); setMessage(`${rows.length} application${rows.length === 1 ? "" : "s"} available.`);
    } catch { setApplications([]); setStatus("failure"); setMessage("We couldn’t verify that access key or load the applications."); }
  };

  return <div className="admin-shell"><header className="admin-header"><button className="brand-lockup" type="button" onClick={onBack}><img className="brand-logo" src="/assets/gc-logo-secondary.png" alt="Garden City Tech" width="960" height="455" /></button><button className="text-button" type="button" onClick={onBack}>Back to site ↗</button></header><main className="admin-main"><div className="admin-intro"><p className="overline">Private workspace</p><h1>Applications<br /><em>in view.</em></h1><p>Review service applications submitted through the Garden City Tech site.</p></div><form className="access-form" onSubmit={loadApplications}><label className="field"><span>Access key</span><input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} autoComplete="current-password" required /></label><button className="button button-dark" type="submit" disabled={status === "loading"}>{status === "loading" ? "Checking…" : "Unlock applications ↗"}</button></form><p className={`admin-message ${status === "failure" ? "is-error" : ""}`} role={status === "failure" ? "alert" : "status"}>{message}</p>{status === "success" && <div className="application-table-wrap"><table className="application-table"><caption className="sr-only">Submitted applications</caption><thead><tr><th>Date</th><th>Applicant</th><th>Organization</th><th>Service</th><th>Package</th><th>Status</th></tr></thead><tbody>{applications.length === 0 ? <tr><td colSpan={6}>No applications yet.</td> : applications.map((application, index) => <tr key={application.reference ?? index}><td>{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}</td><td><strong>{application.contactPerson || "—"}</strong><small>{application.email || "—"}</small></td><td>{application.clientName || "—"}</td><td>{application.selectedService || "—"}</td><td>{application.selectedPackage || "—"}</td><td><span className="status-pill">{application.status || "New"}</span></td></tr>)}</tbody></table></div>}</main></div>;
}

export default App;
