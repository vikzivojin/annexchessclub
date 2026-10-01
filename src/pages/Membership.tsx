import { SectionHeading } from "../components/ui/SectionHeading";
import { Button } from "../components/ui/Button";
import { clubInfo, membershipBenefits } from "../data/clubInfo";
import { MEMBERSHIP_DISCOUNT_RATE, membershipPlans } from "../data/membership";
import "./Membership.scss";

export function Membership() {
  return (
    <>
      <section className="page-header">
        <div className="page-header__inner">
          <span className="page-header__eyebrow">Membership</span>
          <h1>Become a member of the Annex Chess Club</h1>
          <p>
            Membership supports the weekly tournaments, the classes, and the events the club runs through the
            year, and it comes back to you in a few concrete ways.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <SectionHeading eyebrow="What you get" title="Membership benefits" />
          <div className="benefits-grid">
            {membershipBenefits.map((benefit) => (
              <article className="benefit-card" key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pricing-section">
        <div className="section__inner">
          <SectionHeading
            eyebrow="Plans"
            title="Membership options"
            description={`Casual membership covers regular club play; tournament membership adds entry to the club's rated tournaments. Players under 16 or 60 and over get ${
              MEMBERSHIP_DISCOUNT_RATE * 100
            }% off any plan.`}
          />
          <div className="pricing-grid">
            {membershipPlans.map((plan) => (
              <article className="pricing-card" key={plan.id}>
                <span className="pricing-card__category">{plan.category === "casual" ? "Casual" : "Tournament"}</span>
                <h3>{plan.term === "annual" ? "Annual" : "Half-year"}</h3>
                <p className="pricing-card__price">
                  ${plan.price}
                  <span>/{plan.term === "annual" ? "year" : "6 months"}</span>
                </p>
                <p className="pricing-card__label">{plan.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section signup-section">
        <div className="section__inner signup-card">
          <div className="signup-card__text">
            <h2>Ready to join?</h2>
            <p>
              Create an account on the site to get started — registering is free and takes a minute. Online payment
              is coming soon; until then, the club will activate your chosen plan once payment is arranged in
              person or by e-transfer.
            </p>
            <ul className="signup-card__list">
              <li>Stop by {clubInfo.address.line1} on a {clubInfo.openDay} evening</li>
              <li>
                Call <a href={`tel:${clubInfo.phone.replace(/[^0-9]/g, "")}`}>{clubInfo.phone}</a>
              </li>
              <li>
                Email <a href={`mailto:${clubInfo.email}`}>{clubInfo.email}</a>
              </li>
            </ul>
          </div>
          <div className="signup-card__actions">
            <Button to="/register">Create an account</Button>
            <Button to="/schedule" variant="secondary">
              Check this week's schedule
            </Button>
            <p className="signup-card__note">Online membership payment is coming soon as part of this site's next phase.</p>
          </div>
        </div>
      </section>
    </>
  );
}
