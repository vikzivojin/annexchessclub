import { Link } from "react-router-dom";
import { clubInfo } from "../../data/clubInfo";
import "./Footer.scss";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__name">Annex Chess Club</span>
          <p>
            A Toronto community for chess players of every level, meeting every {clubInfo.openDay} at{" "}
            {clubInfo.address.line1}.
          </p>
        </div>

        <div className="footer__col">
          <h4>Visit</h4>
          <address>
            {clubInfo.address.line1}
            <br />
            {clubInfo.address.line2}
          </address>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href={`tel:${clubInfo.phone.replace(/[^0-9]/g, "")}`}>{clubInfo.phone}</a>
            </li>
            <li>
              <a href={`mailto:${clubInfo.email}`}>{clubInfo.email}</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/schedule">Schedule</Link>
            </li>
            <li>
              <Link to="/membership">Membership</Link>
            </li>
            <li>
              <Link to="/classes">Classes</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {year} Annex Chess Club. All rights reserved.</p>
      </div>
    </footer>
  );
}
