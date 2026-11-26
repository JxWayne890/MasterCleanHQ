import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import SEO from '../components/SEO';
import { buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import '../components/contact-navigation.css';
import './walkthroughs.css';

const path = '/walkthroughs';
const title = 'Walkthroughs for Service Business Owners | Master Commercial Clean';
const description = 'A short map of how Master Commercial Clean was built, how a first email stays human, and how to structure automation, with a person still in the loop.';
const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Walkthroughs', path }];
const choices = ['Systems', 'Cold email', 'Automation', 'All three'];
const modules = [
    {
        title: 'How I built Master Commercial Clean',
        paragraphs: [
            'The order of work was a clear offer, a real walkthrough and a written scope, quality checks, a reply to every lead, and a back office on workflows instead of memory.',
            'Master Commercial Clean scaled to six figures in its first two months and is building toward seven.',
            'This module teaches that map.',
        ],
    },
    {
        title: 'Cold email',
        paragraphs: ['This module covers how to research a real building or owner, what a short first note has to do, and how follow up stays human.'],
    },
    {
        title: 'How to structure the automation',
        paragraphs: [
            'The stages are capture, assign, follow up, quote, job tracking, quality, and review.',
            'You will also see how to score a process before automating it, and where a person must stay in the loop.',
        ],
    },
];
const failure = 'The form could not send right now. Please try again.';

function WalkthroughForm() {
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);
    const statusElement = useRef(null);
    const pending = useRef(false);
    const lastSubmission = useRef(null);

    useEffect(() => {
        if (status) statusElement.current?.focus();
    }, [status]);

    async function submit(event) {
        event.preventDefault();
        if (pending.current) return;
        const fields = Object.fromEntries(new FormData(event.currentTarget));
        const signature = JSON.stringify(fields);
        pending.current = true;
        setSending(true);
        setStatus(null);
        const signal = AbortSignal.timeout(15000);

        try {
            if (lastSubmission.current?.signature !== signature) {
                lastSubmission.current = { signature, id: crypto.randomUUID(), referrer: document.referrer };
            }
            const response = await fetch('/api/walkthrough-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...fields, sourcePage: path, referrer: lastSubmission.current.referrer, submissionId: lastSubmission.current.id }),
                signal,
            });
            if (response.status === 429) {
                setStatus({ message: 'Too many requests were received. Please wait a few minutes and try again.' });
            } else if (response.ok && (await response.json()).ok === true) {
                setStatus({ sent: true });
            } else {
                setStatus({ message: failure });
            }
        } catch {
            setStatus({ message: signal.aborted ? 'The request took too long to send. Please try again.' : failure });
        } finally {
            pending.current = false;
            setSending(false);
        }
    }

    if (status?.sent) {
        return (
            <div ref={statusElement} tabIndex={-1} role="status">
                <h3>Thanks. Your request was sent.</h3>
                <p>John will review it and reply using the contact information you provided.</p>
            </div>
        );
    }

    return (
        <form className="mcc-quote-form" onSubmit={submit} aria-busy={sending}>
            <div className="mcc-form-grid">
                <label className="mcc-form-field">Name<input name="name" autoComplete="name" maxLength={120} required /></label>
                <label className="mcc-form-field">Email<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
                <label className="mcc-form-field">Business type<input name="businessType" maxLength={200} placeholder="cleaning, electrical, HVAC" required /></label>
                <label className="mcc-form-field">
                    Which walkthrough
                    <select name="walkthrough" defaultValue="" required>
                        <option value="" disabled>Select a walkthrough</option>
                        {choices.map((choice) => <option key={choice}>{choice}</option>)}
                    </select>
                </label>
            </div>
            <div className="mcc-form-trap" aria-hidden="true">
                <label>Company website<input name="company_website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <button className="mcc-quote-submit" type="submit" disabled={sending}>
                {sending ? 'Sending your request…' : 'Send request'}
            </button>
            {status && <p className="mcc-form-message mcc-form-message-error" ref={statusElement} tabIndex={-1} role="alert">{status.message}</p>}
        </form>
    );
}

export default function WalkthroughsPage() {
    return (
        <div className="walkthroughs">
            <SEO title={title} description={description} path={path} schemas={[
                buildWebPageSchema({ path, title, description }),
                buildBreadcrumbSchema(breadcrumbs),
            ]} />

            <section className="walkthroughs-hero">
                <div className="container" data-motion-group data-motion-intro>
                    <p className="walkthroughs-eyebrow" data-motion="rise">For service business owners</p>
                    <h1 data-motion="rise">Walk<em>throughs</em></h1>
                    <p className="walkthroughs-intro" data-motion="rise">This walkthrough is for service business owners who want the map of how the company and the systems around it were built.</p>
                    <a className="mcc-quote-submit" href="#request">Request a walkthrough</a>
                </div>
            </section>

            <section className="walkthroughs-section container">
                <Breadcrumbs items={breadcrumbs} />
                <h2>What the walkthroughs cover</h2>
                <p>It is not a booking page for a cleaning visit.</p>
                <p>I can teach the map in public. I will not publish the scripts, the prompts, or the working automations.</p>
                <div className="walkthroughs-grid" data-motion-group>
                    {modules.map((module, index) => (
                        <article className="walkthroughs-card" key={module.title} data-motion="rise">
                            <p className="walkthroughs-eyebrow">Module {index + 1}</p>
                            <h3>{module.title}</h3>
                            {module.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </article>
                    ))}
                </div>
            </section>

            <section className="walkthroughs-section walkthroughs-request" id="request">
                <div className="container">
                    <div className="mcc-quote-panel">
                        <div className="mcc-quote-heading">
                            <h2>Request a walkthrough</h2>
                            <p>If you want the walkthrough, tell us who you are and which module you want.</p>
                            <p>John will review the request and follow up with the matching walkthrough.</p>
                        </div>
                        <WalkthroughForm />
                    </div>
                </div>
            </section>

            <section className="walkthroughs-section container">
                <h2>Next steps</h2>
                <article className="walkthroughs-card walkthroughs-next">
                    <h3>Master Commercial Clean</h3>
                    <p>Need a building cleaned?</p>
                    <Link className="mcc-quote-submit" to="/#contact">Request a free quote</Link>
                </article>
            </section>
        </div>
    );
}
