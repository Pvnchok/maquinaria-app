"use client";

import { useState } from "react";

interface AvailabilityCalendarProps {
  diasLibres: string[];
  operadorNombre: string;
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AvailabilityCalendar({ diasLibres, operadorNombre }: AvailabilityCalendarProps) {
  const diasSet = new Set(diasLibres);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const firstDay = (() => {
    const d = new Date(month.year, month.month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const prevMonth = () => {
    setMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 });
  };

  const nextMonth = () => {
    setMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 });
  };

  const availableThisMonth = Array.from(diasSet).filter(d =>
    d.startsWith(`${month.year}-${String(month.month + 1).padStart(2, "0")}`)
  ).length;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        Disponibilidad de {operadorNombre}
      </h3>

      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>&lsaquo;</button>
        <h2 className="cal-title" style={{ fontSize: "1.1rem" }}>{MONTH_NAMES[month.month]} {month.year}</h2>
        <button className="cal-nav-btn" onClick={nextMonth}>&rsaquo;</button>
      </div>

      <div className="cal-grid">
        {DAY_LABELS.map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-day cal-day-empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isAvailable = diasSet.has(dateStr);
          const today = new Date();
          const isToday = today.getFullYear() === month.year && today.getMonth() === month.month && today.getDate() === day;
          const isPast = new Date(dateStr) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <div
              key={dateStr}
              className={`cal-day cal-day-readonly ${isAvailable ? "cal-day-available" : "cal-day-unavailable"} ${isToday ? "cal-day-today" : ""} ${isPast ? "cal-day-past" : ""}`}
              title={isPast ? "Día pasado" : isAvailable ? "Disponible" : "No disponible"}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-available" />
          <span>Disponible</span>
        </div>
        <div className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-unavailable" />
          <span>No disponible</span>
        </div>
      </div>

      <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(34, 197, 94, 0.05)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.15)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <strong style={{ color: "#22c55e" }}>{availableThisMonth}</strong> días disponibles en {MONTH_NAMES[month.month]}
      </div>
    </div>
  );
}
