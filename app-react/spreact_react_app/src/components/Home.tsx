import React from "react";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Descriptive Analytics",
    desc: "Explore CRC incidence trends, mortality rates, and risk factor distributions across European countries.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Predictive Modelling",
    desc: "AI-driven projections of cancer incidence under various intervention and lifestyle scenarios.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    title: "Policy Insights",
    desc: "Translate evidence into actionable recommendations for public health decision-makers.",
  },
];

const Home: React.FC = () => {
  return (
    <>
      <style>{`
        .home-hero {
          background: linear-gradient(135deg, #f0f5f8 0%, #ffffff 60%, #f5f7fb 100%);
          border-bottom: 1px solid var(--border, #e5e7eb);
          padding: 56px 0 48px;
        }
        .home-hero h1 {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          color: var(--text, #0f172a);
          line-height: 1.2;
          margin-bottom: 14px;
        }
        .home-hero h1 span {
          color: var(--brand, #1f6580);
        }
        .home-hero p {
          font-size: 16px;
          color: var(--text-muted, #475569);
          max-width: 560px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e8f2f6;
          color: var(--brand-dark, #185569);
          font-size: 13px;
          font-weight: 600;
          border-radius: 20px;
          padding: 4px 12px;
          margin-bottom: 18px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .home-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand, #1f6580);
          flex-shrink: 0;
        }
        .home-video-wrapper {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(2,6,23,0.1);
          border: 1px solid var(--border, #e5e7eb);
          background: #000;
          aspect-ratio: 16/9;
          max-width: 560px;
          width: 100%;
        }
        .home-video-wrapper iframe {
          width: 100%;
          height: 100%;
          display: block;
          border: none;
        }
        .home-features {
          padding: 48px 0 56px;
        }
        .home-feature-card {
          background: var(--bg, #ffffff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 28px 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
        }
        .home-feature-card:hover {
          box-shadow: 0 8px 24px rgba(31,101,128,0.12);
          border-color: var(--brand, #1f6580);
          transform: translateY(-2px);
        }
        .home-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #e8f2f6;
          color: var(--brand-dark, #185569);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .home-feature-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #0f172a);
          margin-bottom: 8px;
        }
        .home-feature-card p {
          font-size: 15px;
          color: var(--text-muted, #475569);
          line-height: 1.65;
          margin: 0;
        }
        .home-section-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--brand, #1f6580);
          margin-bottom: 8px;
          text-align: center;
        }
        .home-section-title {
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 800;
          color: var(--text, #0f172a);
          margin-bottom: 8px;
          text-align: center;
        }
        .home-section-desc {
          font-size: 15px;
          color: var(--text-muted, #475569);
          max-width: 520px;
          margin: 0 auto 36px;
          line-height: 1.65;
          text-align: center;
        }
      `}</style>

      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="home-badge">
                <span className="home-badge-dot" />
                ONCODIR · DELI Platform
              </div>
              <h1>
                Evidence-based analytics for <span>CRC prevention</span>
              </h1>
              <p>
                A web-based intelligent dashboard with descriptive and predictive analytics
                to inform evidence-based policy decisions on colorectal cancer prevention
                across Europe.
              </p>
            </div>
            <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end">
              <div className="home-video-wrapper">
                <iframe
                  src="https://drive.google.com/file/d/1eJ5PAV4OcF7lokUzzoHG1iIHzQQsQize/preview"
                  allow="fullscreen"
                  allowFullScreen
                  title="DELI platform overview"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="container">
          <p className="home-section-label">What you can do</p>
          <h2 className="home-section-title">Platform capabilities</h2>
          <p className="home-section-desc">
            DELI combines epidemiological data with AI-driven models to support
            evidence-based decisions at the national and European level.
          </p>
          <div className="row g-4 justify-content-center">
            {features.map((f) => (
              <div className="col-md-4" key={f.title}>
                <div className="home-feature-card">
                  <div className="home-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
