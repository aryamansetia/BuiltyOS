import { useTranslation } from "react-i18next";

function StatusTimeline({ timeline = [] }) {
  const { t } = useTranslation();

  return (
    <div className="timeline-wrap">
      {timeline.map((item) => (
        <div key={item.label} className={`timeline-item ${item.completed ? "done" : "pending"}`}>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <h4 className="typo-label font-semibold text-brand-secondary">{t(`status.${item.label}`, item.label)}</h4>
            <p className="typo-helper">{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatusTimeline;
