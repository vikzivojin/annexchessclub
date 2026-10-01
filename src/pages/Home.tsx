import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ChessboardMark } from "../components/ui/ChessboardMark";
import { clubInfo, divisions, membershipBenefits } from "../data/clubInfo";
import { useAnnouncements } from "../firebase/useContent";
import "./Home.scss";

export function Home() {
  const { items: announcements } = useAnnouncements();

  return (
    <>
      {announcements.length > 0 && (
        <section className="announcements-bar">
          <div className="announcements-bar__inner">
            <span className="announcements-bar__label">Announcement</span>
            <p>
              <strong>{announcements[0].title}:</strong> {announcements[0].body}
            </p>
          </div>
        </section>
      )}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">Toronto, since the neighbourhood needed a home board</span>
            <h1>A club for every player who wants to sit down and play.</h1>
            <p>
              The Annex Chess Club meets every {clubInfo.openDay} at {clubInfo.address.line1} for casual games,
              five round tournaments, and a community that takes the game seriously without taking itself too
              seriously.
            </p>
            <div className="hero__actions">
              <Button to="/membership">Join the club</Button>
              <Button to="/schedule" variant="secondary">
                See this week's schedule
              </Button>
            </div>
          </div>
          <div className="hero__visual">
            <ChessboardMark />
          </div>
        </div>
      </section>

      <section className="quick-facts">
        <div className="quick-facts__inner">
          <div className="quick-fact">
            <span className="quick-fact__label">Open</span>
            <span className="quick-fact__value">Every {clubInfo.openDay}</span>
          </div>
          <div className="quick-fact">
            <span className="quick-fact__label">Skittles room</span>
            <span className="quick-fact__value">{clubInfo.hours.skittles}</span>
          </div>
          <div className="quick-fact">
            <span className="quick-fact__label">Tournament round one</span>
            <span className="quick-fact__value">{clubInfo.hours.tournament}</span>
          </div>
          <div className="quick-fact">
            <span className="quick-fact__label">Address</span>
            <span className="quick-fact__value">{clubInfo.address.line1}</span>
          </div>
        </div>
      </section>

      <section className="section divisions-section">
        <div className="section__inner">
          <SectionHeading
            eyebrow="Weekly tournament"
            title="Three divisions, one clock"
            description="Every Monday night tournament runs five rounds at a 90 minute plus 30 second time control, split into sections so games stay competitive at every level."
          />
          <div className="divisions-grid">
            {divisions.map((division) => (
              <article className="division-card" key={division.name}>
                <h3>{division.name}</h3>
                <p>{division.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section membership-section">
        <div className="section__inner membership-section__grid">
          <SectionHeading
            eyebrow="Membership"
            title="Everything that comes with a membership"
            description="A membership supports the club's tournaments and classes, and pays you back through the following."
          />
          <ul className="benefits-list">
            {membershipBenefits.map((benefit) => (
              <li key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="membership-section__cta">
          <Link to="/membership">
            View membership details
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>First time coming by? Just show up on a Monday.</h2>
          <p>
            No booking required for casual play. Arrive at {clubInfo.hours.skittles} to get a board in the
            skittles room, or stay for the {clubInfo.hours.tournament} tournament round.
          </p>
          <Button to="/contact" variant="secondary" className="cta-banner__button">
            Get directions and contact info
          </Button>
        </div>
      </section>
    </>
  );
}
