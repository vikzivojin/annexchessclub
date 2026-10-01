import { Button } from "../components/ui/Button";
import "./NotFound.scss";

export function NotFound() {
  return (
    <section className="not-found">
      <div className="not-found__inner">
        <span className="not-found__eyebrow">404</span>
        <h1>That page moved, or never had a board set up.</h1>
        <p>Head back to the home page to find your way around the club.</p>
        <Button to="/">Back to home</Button>
      </div>
    </section>
  );
}
