import {
  type ChangeEvent,
  type FormEvent,
  type PointerEvent,
  useEffect,
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

const services = [
  {
    number: "01",
    title: "Website Development",
    description: "Fast, responsive websites shaped around your goals, content, and customers.",
    icon: "✦",
  },
  {
    number: "02",
    title: "UI/UX Design",
    description: "Clear, useful interfaces that make digital experiences easier to understand and use.",
    icon: "⌁",
  },
  {
    number: "03",
    title: "Mobile App Development",
    description: "Thoughtful mobile products that help people do more wherever they are.",
    icon: "◌",
  },
  {
    number: "04",
    title: "SEO and Digital Marketing",
    description: "Practical strategies that improve discoverability and help the right audience find you.",
    icon: "↗",
  },
  {
    number: "05",
    title: "Brand Strategy",
    description: "A focused brand direction that gives your business a clearer, more consistent voice.",
    icon: "⌘",
  },
  {
    number: "06",
    title: "Digital Consulting",
    description: "Experienced guidance for technology decisions, priorities, and digital change.",
    icon: "＋",
  },
] as const;

const packages: Array<{
  name: PackageName;
  eyebrow: string;
  description: string;
  points: string[];
}> = [
  {
    name: "Starter",
    eyebrow: "A focused first step",
    description: "Basic website/app development, fixed scope and limited support.",
    points: ["Basic website/app development", "Fixed scope", "Limited support"],
  },
  {
    name: "Growth",
    eyebrow: "Build with momentum",
    description: "Custom development, UI/UX design, QA testing, maintenance, photo/video production and 3D animation.",
    points: ["Custom development", "UI/UX design and QA testing", "Maintenance, photo/video production, and 3D animation"],
  },
  {
    name: "Enterprise",
    eyebrow: "A dedicated capability",
    description: "Dedicated team, project management, priority support, security reviews and ongoing enhancements.",
    points: ["Dedicated team", "Project management and priority support", "Security reviews and ongoing enhancements"],
  },
  {
    name: "Custom",
    eyebrow: "Make the brief your own",
    description: "A flexible solution based on the client’s requirements.",
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
const maxFileSize = 10 * 1024 * 1024;

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
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const openApplication = (packageName?: PackageName) => {
    setSelectedPackage(packageName);
    setIsApplicationOpen(true);
    window.setTimeout(() => document.getElementById("application")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="/" onClick={(event) => { event.preventDefault(); scrollTo("main-content"); }}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand-lockup" type="button" onClick={() => scrollTo("home")} aria-label="Garden City Tech home">
            <img className="brand-logo" src="/assets/gc-logo-horizontal.png" alt="Garden City Tech" width="560" height="240" />
            <img className="brand-icon" src="/assets/gc-logo-icon.png" alt="" aria-hidden="true" width="180" height="180" />
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
          </button>
          <nav id="primary-navigation" className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label="Primary navigation">
            <button type="button" onClick={() => scrollTo("home")}>Home</button>
            <button type="button" onClick={() => scrollTo("services")}>Services</button>
            <button type="button" onClick={() => scrollTo("about")}>About</button>
            <button type="button" onClick={() => scrollTo("packages")}>Packages</button>
            <button className="nav-apply" type="button" onClick={() => openApplication()}>Apply for Service <span aria-hidden="true">↗</span></button>
            <button type="button" onClick={() => scrollTo("contact")}>Contact</button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section id="home" className="hero-section section-dark" aria-labelledby="hero-heading">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="overline overline-lime">Rooted in Nepal · building for the world</p>
              <h1 id="hero-heading">Technology that <em>grows</em> with you.</h1>
              <p className="hero-intro">We design and build thoughtful digital products for people and organizations ready for their next chapter.</p>
              <div className="hero-actions">
                <button className="button button-lime" type="button" onClick={() => openApplication()}>Start a conversation <span aria-hidden="true">↗</span></button>
                <button className="text-button light-button" type="button" onClick={() => scrollTo("services")}>Explore services <span aria-hidden="true">↓</span></button>
              </div>
            </div>
            <div className="hero-visual" aria-label="Video placeholder: a future Garden City Tech story film will be shown here">
              <div className="video-placeholder">
                <div className="video-grid-lines" aria-hidden="true" />
                <div className="video-label"><span className="status-dot" /> A glimpse of what’s possible</div>
                <MagneticPlayButton />
                <span className="video-caption">Story film · coming soon</span>
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
              <button className="arrow-link" type="button" onClick={() => scrollTo("about")}>Meet the thinking behind the work <span aria-hidden="true">↘</span></button>
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
              {services.map((service) => <article className="service-card" key={service.number}>
                <div className="service-card-top"><span className="service-number">{service.number}</span><span className="service-icon" aria-hidden="true">{service.icon}</span></div>
                <h3>{service.title}</h3><p>{service.description}</p><span className="card-arrow" aria-hidden="true">↗</span>
              </article>)}
            </div>
          </div>
        </section>

        <section className="why-section section-dark" aria-labelledby="why-heading">
          <div className="container why-grid">
            <div className="why-stamp" aria-hidden="true"><img src="/assets/gc-logo-icon.png" alt="" width="180" height="180" /><span>GCT<br />/ 2026</span></div>
            <div><p className="overline overline-lime">Why choose us</p><h2 id="why-heading">Small enough to <em>listen.</em><br />Skilled enough to deliver.</h2><p className="large-copy light-copy">We pair the attentiveness of a close partner with the discipline of a capable product team. Clear communication is part of the work, not an afterthought.</p>
              <div className="why-list"><div><span>01</span><p>People-first collaboration</p></div><div><span>02</span><p>Purposeful, practical innovation</p></div><div><span>03</span><p>Care beyond launch</p></div></div>
            </div>
          </div>
        </section>

        <section className="process-section section-light" aria-labelledby="process-heading">
          <div className="container"><div className="section-heading split-heading"><div><p className="overline">How we work</p><h2 id="process-heading">A clear path from <em>idea</em> to impact.</h2></div><p>Six steps, shared openly. The right amount of structure to keep good work moving.</p></div>
            <ol className="process-list">{processSteps.map(([number, title, description]) => <li key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div><span className="process-arrow" aria-hidden="true">↗</span></li>)}</ol>
          </div>
        </section>

        <section id="packages" className="packages-section section-mint" aria-labelledby="packages-heading">
          <div className="container"><div className="section-heading package-heading"><p className="overline">Ways to begin</p><h2 id="packages-heading">Find your starting <em>point.</em></h2><p>No two organizations are alike. These packages are conversation starters, shaped to flex around the work.</p></div>
            <div className="package-grid">{packages.map((pack) => <article className="package-card" key={pack.name}><p className="package-eyebrow">{pack.eyebrow}</p><h3>{pack.name}</h3><p>{pack.description}</p><ul>{pack.points.map((point) => <li key={point}><span aria-hidden="true">+</span>{point}</li>)}</ul><button className="button button-outline" type="button" onClick={() => openApplication(pack.name)}>Choose this package <span aria-hidden="true">↗</span></button></article>)}</div>
          </div>
        </section>

        <section id="about" className="about-section section-light" aria-labelledby="about-heading">
          <div className="container about-grid"><div><p className="overline">01 — Foundations</p><h2 id="about-heading">Rooted here.<br /><em>Ready for anywhere.</em></h2><p className="large-copy">Garden City Tech is a software development and technology company creating digital solutions that help businesses innovate, grow, and make a lasting impact.</p></div>
            <div className="values-stack"><div className="manifesto-card card-vision"><p className="overline">Vision</p><p>To be a globally trusted technology partner, recognized for delivering innovative solutions while empowering people to creatively impact future generations.</p></div><div className="manifesto-card card-mission"><p className="overline">Mission</p><p>To build technology and provide long-term support that helps businesses innovate, grow, and turn their vision into reality through collaboration, integrity, and technical excellence.</p></div><div className="values-card"><p className="overline">Values we bring</p><div className="value-tags"><span>People first</span><span>Innovation with purpose</span><span>Excellence</span><span>Integrity</span><span>Collaboration</span><span>Continuous learning</span><span>Communication</span></div></div></div>
          </div>
        </section>

        {isApplicationOpen && <ApplicationSection selectedPackage={selectedPackage} onClose={() => setIsApplicationOpen(false)} />}

        <section id="contact" className="cta-section section-dark" aria-labelledby="cta-heading"><div className="cta-glow" aria-hidden="true" /><div className="container cta-content"><p className="overline overline-lime">Your next chapter starts here</p><h2 id="cta-heading">Let’s grow<br /><em>something good.</em></h2><p>Tell us where you’re headed. We’ll bring curiosity, clarity, and the technical care to help you get there.</p><button className="button button-lime" type="button" onClick={() => openApplication()}>Apply for service <span aria-hidden="true">↗</span></button></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><div><img className="footer-logo" src="/assets/gc-logo-horizontal.png" alt="Garden City Tech" width="560" height="240" /><p>Rooted in Nepal. Building technology for the world.</p></div><div className="footer-nav"><p className="overline">Explore</p><button type="button" onClick={() => scrollTo("services")}>Services</button><button type="button" onClick={() => scrollTo("about")}>About</button><button type="button" onClick={() => scrollTo("packages")}>Packages</button></div><div className="footer-nav"><p className="overline">Start here</p><button type="button" onClick={() => openApplication()}>Apply for service</button><button type="button" onClick={() => scrollTo("contact")}>Contact</button><button className="admin-link" type="button" onClick={() => onNavigate("/admin")}>Admin access <span aria-hidden="true">↗</span></button></div></div><div className="container footer-bottom"><span>© 2026 Garden City Tech Pvt. Ltd.</span><span>Technology that grows with you.</span></div></footer>
    </div>
  );
}

function MagneticPlayButton() {
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

  return <div className="play-control-layer" onPointerMove={handlePointerMove} onPointerLeave={() => setOffset({ x: 0, y: 0 })}><button className="magnetic-play" type="button" aria-label="Play the Garden City Tech story film" style={reducedMotion ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` }}><span className="play-triangle" aria-hidden="true" /></button></div>;
}

function ApplicationSection({ selectedPackage, onClose }: { selectedPackage?: PackageName; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>({ ...initialForm, selectedPackage: selectedPackage ?? "" });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "failure">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => { setForm((current) => ({ ...current, selectedPackage: selectedPackage ?? "" })); }, [selectedPackage]);

  const updateField = (field: keyof ApplicationForm, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFileError("");
    if (!selectedFile) { setFile(null); return; }
    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if ((!acceptedFileTypes.includes(selectedFile.type) && !acceptedFileExtensions.includes(extension)) || selectedFile.size > maxFileSize) {
      setFile(null);
      setFileError(selectedFile.size > maxFileSize ? "That file is larger than 10 MB. Please choose a smaller file." : "Please upload a PDF, DOC, DOCX, PNG, JPG, or ZIP file.");
      event.target.value = "";
      return;
    }
    setFile(selectedFile);
  };

  const validateStep = (currentStep: number) => {
    setFieldError("");
    if (currentStep === 1 && (!form.clientName.trim() || !form.contactPerson.trim() || !form.email.trim() || !form.phone.trim() || !form.country.trim())) { setFieldError("Please complete your organization, contact person, email, phone, and country before continuing."); return false; }
    if (currentStep === 1 && !/^\S+@\S+\.\S+$/.test(form.email.trim())) { setFieldError("Please enter a valid email address."); return false; }
    if (currentStep === 2 && (!form.selectedService || !form.selectedPackage)) { setFieldError("Please choose a service and a starting package."); return false; }
    if (currentStep === 3 && (!form.projectDescription.trim() || !form.requiredPages.trim() || !form.budgetRange.trim() || !form.preferredStartDate || !form.expectedCompletionDate)) { setFieldError("Please complete the project description, required pages or features, budget range, and timeline before continuing."); return false; }
    if (currentStep === 3 && form.website && !/^https?:\/\//i.test(form.website.trim())) { setFieldError("Existing website URL must start with http:// or https://."); return false; }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep((current) => Math.min(current + 1, 4)); };
  const previousStep = () => { setFieldError(""); setStep((current) => Math.max(current - 1, 1)); };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(4) || !form.consent) { setFieldError(!form.consent ? "Please agree to be contacted about this application." : "Please review the required fields."); return; }
    setSubmitState("loading"); setSubmitMessage("");
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
    if (file) payload.append("attachment", file);
    try {
      const response = await fetch("/api/applications", { method: "POST", body: payload });
      const data = await response.json() as { reference?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Application request failed");
      setSubmitState("success");
      setSubmitMessage(data.reference ? `Your reference number is ${data.reference}. Keep it for your records.` : "Thank you. Your application is on its way to our team.");
    } catch (error) {
      setSubmitState("failure");
      setSubmitMessage(error instanceof Error ? error.message : "We couldn’t send your application right now. Please try again in a moment.");
    }
  };

  if (submitState === "success") return <section id="application" className="application-section section-dark" aria-live="polite"><div className="container application-result"><span className="result-mark">✓</span><p className="overline overline-lime">Application received</p><h2>We’ll be in <em>touch.</em></h2><p>{submitMessage}</p><button className="button button-lime" type="button" onClick={onClose}>Back to the site <span aria-hidden="true">↗</span></button></div></section>;

  return <section id="application" className="application-section section-dark" aria-labelledby="application-heading"><div className="container"><div className="application-top"><div><p className="overline overline-lime">Apply for service</p><h2 id="application-heading">Let’s make a good<br /><em>plan together.</em></h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Close application form">×</button></div><div className="form-layout"><div className="form-sidebar"><p>Application / 0{step}</p><div className="progress-rail" aria-label={`Step ${step} of 4`}><span style={{ height: `${step * 25}%` }} /></div><ol>{["About you", "The brief", "The details", "Review & send"].map((label, index) => <li className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol><p className="form-note">We only use your information to understand the work and respond to your application.</p></div>
          <form className="application-form" onSubmit={submitApplication} noValidate><div className="honeypot" aria-hidden="true"><label htmlFor="honeypot">Website</label><input id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(event) => updateField("honeypot", event.target.value)} /></div>
            {step === 1 && <fieldset><legend>Tell us about you</legend><p className="fieldset-intro">A few basics are enough to start.</p><div className="field-grid"><Field label="Client or organization name" required value={form.clientName} onChange={(value) => updateField("clientName", value)} autoComplete="organization" /><Field label="Contact person" required value={form.contactPerson} onChange={(value) => updateField("contactPerson", value)} autoComplete="name" /><Field label="Email address" required type="email" value={form.email} onChange={(value) => updateField("email", value)} autoComplete="email" /><Field label="Phone number" required type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} autoComplete="tel" /><Field label="Country" required value={form.country} onChange={(value) => updateField("country", value)} autoComplete="country-name" /></div></fieldset>}
            {step === 2 && <fieldset><legend>Shape the brief</legend><p className="fieldset-intro">Choose the path that feels closest. We’ll refine it together.</p><div className="field-grid"><label className="field wide"><span>Selected service <b aria-hidden="true">*</b></span><select aria-label="Selected service" value={form.selectedService} onChange={(event) => updateField("selectedService", event.target.value)}><option value="">Select a service</option>{services.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}</select></label><label className="field wide"><span>Selected package <b aria-hidden="true">*</b></span><select aria-label="Selected package" value={form.selectedPackage} onChange={(event) => updateField("selectedPackage", event.target.value as PackageName)}><option value="">Select a package</option>{packages.map((pack) => <option key={pack.name} value={pack.name}>{pack.name} — {pack.eyebrow}</option>)}</select></label></div></fieldset>}
            {step === 3 && <fieldset><legend>Give us the details</legend><p className="fieldset-intro">The more context you share, the more useful our first response can be.</p><label className="field wide"><span>Project description <b aria-hidden="true">*</b></span><textarea rows={5} value={form.projectDescription} onChange={(event) => updateField("projectDescription", event.target.value)} placeholder="What are you hoping to create, improve, or change?" /></label><label className="field wide"><span>Required pages or features <b aria-hidden="true">*</b></span><textarea rows={3} value={form.requiredPages} onChange={(event) => updateField("requiredPages", event.target.value)} placeholder="Which pages, features, or capabilities should we plan for?" /></label><div className="field-grid"><Field label="Existing website URL" value={form.website} onChange={(value) => updateField("website", value)} type="url" /><label className="field"><span>Budget range <b aria-hidden="true">*</b></span><select value={form.budgetRange} onChange={(event) => updateField("budgetRange", event.target.value)}><option value="">Select an option</option><option>Not sure yet</option><option>To discuss</option><option>I’ll share a range after our first conversation</option></select></label><Field label="Preferred start date" required type="date" value={form.preferredStartDate} onChange={(value) => updateField("preferredStartDate", value)} /><Field label="Expected completion date" required type="date" value={form.expectedCompletionDate} onChange={(value) => updateField("expectedCompletionDate", value)} /></div></fieldset>}
            {step === 4 && <fieldset><legend>Review & send</legend><p className="fieldset-intro">One last thing: attach a useful brief or reference if you have one.</p><label className="file-drop"><span className="file-icon" aria-hidden="true">↥</span><span><strong>{file ? file.name : "Upload a brief or reference"}</strong><small>PDF, DOC, DOCX, PNG, JPG, or ZIP · max 10 MB</small></span><input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" onChange={onFileChange} /></label>{fileError && <p className="form-error" role="alert">{fileError}</p>}<div className="review-card"><div><span>Organization</span><strong>{form.clientName || "—"}</strong></div><div><span>Service</span><strong>{form.selectedService || "—"}</strong></div><div><span>Package</span><strong>{form.selectedPackage || "—"}</strong></div><div><span>Email</span><strong>{form.email || "—"}</strong></div></div><label className="consent-check"><input type="checkbox" checked={form.consent} onChange={(event) => updateField("consent", event.target.checked)} /><span>I agree to be contacted by Garden City Tech about this application.</span></label></fieldset>}
            {fieldError && <p className="form-error" role="alert">{fieldError}</p>}{submitState === "failure" && <p className="form-error" role="alert">{submitMessage}</p>}<div className="form-actions">{step > 1 && <button className="text-button light-button" type="button" onClick={previousStep}>← Back</button>}{step < 4 ? <button className="button button-lime" type="button" onClick={nextStep}>Continue <span aria-hidden="true">→</span></button> : <button className="button button-lime" type="submit" disabled={submitState === "loading"}>{submitState === "loading" ? "Sending…" : "Send application ↗"}</button>}</div>
          </form></div></div></section>;
}

function Field({ label, value, onChange, type = "text", required = false, wide = false, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; wide?: boolean; autoComplete?: string }) {
  return <label className={`field${wide ? " wide" : ""}`}><span>{label} {required && <b aria-hidden="true">*</b>}</span><input type={type} value={value} required={required} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} /></label>;
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

  return <div className="admin-shell"><header className="admin-header"><button className="brand-lockup" type="button" onClick={onBack}><img className="brand-logo" src="/assets/gc-logo-horizontal.png" alt="Garden City Tech" width="560" height="240" /></button><button className="text-button" type="button" onClick={onBack}>Back to site ↗</button></header><main className="admin-main"><div className="admin-intro"><p className="overline">Private workspace</p><h1>Applications<br /><em>in view.</em></h1><p>Review service applications submitted through the Garden City Tech site.</p></div><form className="access-form" onSubmit={loadApplications}><label className="field"><span>Access key</span><input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} autoComplete="current-password" required /></label><button className="button button-dark" type="submit" disabled={status === "loading"}>{status === "loading" ? "Checking…" : "Unlock applications ↗"}</button></form><p className={`admin-message ${status === "failure" ? "is-error" : ""}`} role={status === "failure" ? "alert" : "status"}>{message}</p>{status === "success" && <div className="application-table-wrap"><table className="application-table"><caption className="sr-only">Submitted applications</caption><thead><tr><th>Date</th><th>Applicant</th><th>Organization</th><th>Service</th><th>Package</th><th>Status</th></tr></thead><tbody>{applications.length === 0 ? <tr><td colSpan={6}>No applications yet.</td></tr> : applications.map((application, index) => <tr key={application.reference ?? index}><td>{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}</td><td><strong>{application.contactPerson || "—"}</strong><small>{application.email || "—"}</small></td><td>{application.clientName || "—"}</td><td>{application.selectedService || "—"}</td><td>{application.selectedPackage || "—"}</td><td><span className="status-pill">New</span></td></tr>)}</tbody></table></div>}</main></div>;
}

export default App;
