import { useState } from "react";
import { SectionHeading } from "../components/ui/SectionHeading";
import { EventModal } from "../components/ui/EventModal";
import { clubInfo } from "../data/clubInfo";
import { useScheduleItems } from "../firebase/useContent";
import type { ScheduleItem } from "../firebase/types";
import "./Schedule.scss";

export function Schedule() {
  const { items: weeklySchedule } = useScheduleItems();
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  return (
    <>
      <section className="page-header">
        <div className="page-header__inner">
          <span className="page-header__eyebrow">Schedule</span>
          <h1>What a Monday at the club looks like</h1>
          <p>Doors open at {clubInfo.address.line1} every {clubInfo.openDay}. Here is the full run of a typical evening — click any entry for full details and to register.</p>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <SectionHeading eyebrow="In person" title="Weekly Monday schedule" />
          <ol className="timeline">
            {weeklySchedule.map((item) => (
              <li key={item.id}>
                <button type="button" className="timeline__trigger" onClick={() => setSelectedItem(item)}>
                  <span className="timeline__time">{item.time}</span>
                  <div className="timeline__content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {selectedItem && <EventModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
}
