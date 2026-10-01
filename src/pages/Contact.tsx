import { SectionHeading } from "../components/ui/SectionHeading";
import { clubInfo } from "../data/clubInfo";
import "./Contact.scss";

export function Contact() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    clubInfo.address.mapQuery,
  )}&output=embed`;

  return (
    <>
      <section className="page-header">
        <div className="page-header__inner">
          <span className="page-header__eyebrow">Contact</span>
          <h1>Get in touch or find us on a Monday night</h1>
          <p>
            The easiest way to meet the club is to come by in person, but reach out ahead of time with any
            questions about classes, membership, or tournaments.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__inner contact-grid">
          <div className="contact-details">
            <SectionHeading eyebrow="Reach us" title="Contact details" />
            <dl>
              <div>
                <dt>Address</dt>
                <dd>
                  {clubInfo.address.line1}
                  <br />
                  {clubInfo.address.line2}
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${clubInfo.phone.replace(/[^0-9]/g, "")}`}>{clubInfo.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${clubInfo.email}`}>{clubInfo.email}</a>
                </dd>
              </div>
              <div>
                <dt>Open hours</dt>
                <dd>
                  Every {clubInfo.openDay}, casual play from {clubInfo.hours.skittles}, tournament round one at{" "}
                  {clubInfo.hours.tournament}
                </dd>
              </div>
            </dl>
          </div>

          <div className="contact-map">
            <iframe
              title="Map to the Annex Chess Club"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
