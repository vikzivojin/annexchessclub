import { SectionHeading } from "../components/ui/SectionHeading";
import { Button } from "../components/ui/Button";
import { clubInfo } from "../data/clubInfo";
import "./About.scss";

export function About() {
  return (
    <>
      <section className="page-header">
        <div className="page-header__inner">
          <span className="page-header__eyebrow">About the club</span>
          <h1>A neighbourhood club built around the board, not the building.</h1>
          <p>
            The Annex Chess Club exists for one reason: to give players in Toronto a regular, welcoming place to
            play. Whether you are learning how the pieces move or chasing a title, there is a section for you
            every {clubInfo.openDay}.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__inner about-grid">
          <div>
            <SectionHeading eyebrow="What we're about" title="Chess for everyone means exactly that" />
            <p>
              We keep the club open to players at every stage, from someone sitting down for their first tournament
              game to experienced competitors chasing rating points in the Crown section. The skittles room stays
              informal on purpose, so newer members can watch, ask questions, and get a feel for tournament play
              before jumping in.
            </p>
            <p>
              Beyond the weekly ladder, members organize and take part in some of the longest running tournaments in
              the region, including the Toronto Open and the Toronto Closed Championship. The club also fields
              players at the Ontario Open and the Canadian Transnational most years.
            </p>
          </div>
          <div className="about-card">
            <h3>Where to find us</h3>
            <p>
              {clubInfo.address.line1}
              <br />
              {clubInfo.address.line2}
            </p>
            <p>
              Open every {clubInfo.openDay}, with casual play from {clubInfo.hours.skittles} and the weekly
              tournament starting at {clubInfo.hours.tournament}.
            </p>
            <Button to="/contact" variant="secondary">
              Get directions
            </Button>
          </div>
        </div>
      </section>

      <section className="section values-section">
        <div className="section__inner">
          <SectionHeading
            eyebrow="How the club runs"
            title="A few things members can count on"
            description="Small, consistent habits are what keep a volunteer run club going for years."
          />
          <div className="values-grid">
            <article>
              <h3>Consistency</h3>
              <p>
                The doors open every {clubInfo.openDay} without fail, holidays aside, so members can build the club
                into a weekly routine rather than checking for updates.
              </p>
            </article>
            <article>
              <h3>Fair sections</h3>
              <p>
                Tournament divisions are split by rating so games stay close, whether you are in the Crown section
                or just starting out in U1400.
              </p>
            </article>
            <article>
              <h3>Room to learn</h3>
              <p>
                Beginner and intermediate classes run in person, with advanced online instruction twice a week for
                players working toward tournament strength.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
