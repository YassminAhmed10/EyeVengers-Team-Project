import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";

const HELP_TOPICS = [
  {
    title: "Orders & Tracking",
    text: "Track shipment updates, delays, and delivery confirmations.",
    to: "/track-order",
  },
  {
    title: "Returns & Exchanges",
    text: "Start self-service returns and monitor approval progress.",
    to: "/returns-center",
  },
  {
    title: "Sizing & Fit",
    text: "Use our interactive sizing assistant to pick the right frame.",
    to: "/size-guide",
  },
  {
    title: "Prescription Support",
    text: "Guidance on lens options and uploading your prescription.",
    to: "/fit-assistant",
  },
];

const FAQ = [
  "How do I track my order after checkout?",
  "Can I exchange the frame color after delivery?",
  "Do you offer cash on delivery in all governorates?",
  "What if my frame arrives damaged?",
  "Can I order frame first and add lenses later?",
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketIssue, setTicketIssue] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaq = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return FAQ;
    }

    return FAQ.filter((item) => item.toLowerCase().includes(term));
  }, [query]);

  const submitTicket = async (event) => {
    event.preventDefault();

    if (!ticketEmail.includes("@") || ticketIssue.trim().length < 10) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <main className="main container">
      <PageHero
        eyebrow="Support"
        title="Help Center"
        description="Find quick answers, launch support flows, or submit a ticket."
      />

      <section className="help-grid">
        {HELP_TOPICS.map((topic) => (
          <article key={topic.title} className="help-card">
            <h3>{topic.title}</h3>
            <p>{topic.text}</p>
            <Link className="btn-link" to={topic.to}>
              Open
            </Link>
          </article>
        ))}
      </section>

      <section className="help-layout">
        <article className="help-card">
          <h3>Search FAQ</h3>
          <input
            type="search"
            placeholder="Search for your question..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ul className="help-faq-list">
            {filteredFaq.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {filteredFaq.length === 0 && (
            <p className="help-empty-note">No FAQ matches this term. Try another keyword.</p>
          )}
        </article>

        <article className="help-card">
          <h3>Open Support Ticket</h3>
          <form className="help-ticket-form" onSubmit={submitTicket}>
            <input
              type="email"
              placeholder="Your email"
              value={ticketEmail}
              onChange={(event) => setTicketEmail(event.target.value)}
            />
            <textarea
              rows={4}
              placeholder="Describe your issue"
              value={ticketIssue}
              onChange={(event) => setTicketIssue(event.target.value)}
            />
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
          {sent && <span className="status-pill status-pill--success">Ticket submitted. Our team will contact you shortly.</span>}
        </article>
      </section>
    </main>
  );
}
