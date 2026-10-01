import { SectionHeading } from "../components/ui/SectionHeading";
import { Button } from "../components/ui/Button";
import { classOfferings } from "../data/clubInfo";
import "./Classes.scss";

export function Classes() {
  return (
    <>
      <section className="page-header">
        <div className="page-header__inner">
          <span className="page-header__eyebrow">Classes</span>
          <h1>Instruction for every stage of the game</h1>
          <p>
            From learning how the pieces move to preparing for rated tournaments, the club runs classes that meet
            players where they are.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <SectionHeading eyebrow="Programs" title="Current class offerings" />
          <div className="classes-grid">
            {classOfferings.map((offering) => (
              <article className="class-card" key={offering.title}>
                <h3>{offering.title}</h3>
                <p>{offering.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section classes-cta">
        <div className="section__inner classes-cta__inner">
          <div>
            <h2>Ask about class times and openings</h2>
            <p>
              Class schedules shift with demand, so reach out for the current calendar and to find a spot that
              fits.
            </p>
          </div>
          <Button to="/contact">Contact the club</Button>
        </div>
      </section>
    </>
  );
}
