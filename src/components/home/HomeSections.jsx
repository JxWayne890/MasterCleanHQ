import { ArrowUpRight, Building2, Check, Layers3, MapPin, Phone } from 'lucide-react';
import './home-sections.css';

const services = [
    {
        number: '01',
        Icon: Building2,
        title: 'Everyday cleaning, handled.',
        description: 'Recurring cleaning for offices, schools, churches, and commercial properties. Start with the spaces your staff and visitors use most.',
        tasks: 'Restrooms · Breakrooms · Floors · Common areas',
        href: '/commercial-cleaning',
        link: 'Commercial cleaning',
    },
    {
        number: '02',
        Icon: Layers3,
        title: 'A clean finish for your project.',
        description: 'Detailed cleanup after construction or a remodel. Address fine dust, surfaces, fixtures, and floors before the building changes hands.',
        tasks: 'New builds · Remodels · Tenant improvements',
        href: '/post-construction-cleaning',
        link: 'Post construction cleanup',
    },
    {
        number: '03',
        Icon: Check,
        title: 'Give the details their due.',
        description: 'Go beyond the routine with a scope for deeper cleaning, floor care, and the areas that need extra attention in your building.',
        tasks: 'Deep cleaning · Floor care · Facility resets',
        href: '/specialized-cleaning',
        link: 'Specialized cleaning',
    },
];

const steps = [
    {
        number: '01',
        title: 'Tell us about your building.',
        description: 'Call or send a quote request. Share your location, the type of space, and what you would like to improve.',
    },
    {
        number: '02',
        title: 'Work through the scope.',
        description: 'We discuss the rooms, cleaning tasks, access, and schedule. A building walkthrough helps make the requirements clear.',
    },
    {
        number: '03',
        title: 'Review a written quote.',
        description: 'See the proposed work and frequency before you decide. Ask questions and make sure the plan fits your property.',
    },
];

const guides = [
    {
        category: 'Planning your budget',
        title: 'What goes into a commercial cleaning quote?',
        description: 'The building details that shape cleaning costs in San Angelo.',
        href: '/guides/commercial-cleaning-cost-san-angelo',
    },
    {
        category: 'Managing your workplace',
        title: 'An office cleaning checklist you can use.',
        description: 'A practical starting point for daily, weekly, and periodic tasks.',
        href: '/guides/office-cleaning-checklist-small-businesses',
    },
    {
        category: 'Choosing your provider',
        title: 'What should a janitorial contract cover?',
        description: 'Know what to look for before signing a cleaning agreement.',
        href: '/guides/what-to-look-for-janitorial-contract',
    },
];

// Shared with the homepage SEO so the visible questions and structured data agree.
// eslint-disable-next-line react-refresh/only-export-components
export const homeFaqs = [
    {
        question: 'What types of buildings do you clean?',
        answer: 'We provide commercial cleaning for offices, schools, churches, and commercial properties. We also handle post construction cleanup and specialized cleaning. Tell us about your building so we can discuss the right scope.',
    },
    {
        question: 'How much will cleaning cost for our building?',
        answer: 'The quote depends on the areas being cleaned, their condition, how often you need service, and the tasks included. We review your requirements and provide a written quote. A walkthrough helps us understand the work before pricing it.',
    },
    {
        question: 'Can cleaning fit around our operating hours?',
        answer: 'We discuss your opening hours, access requirements, and preferred cleaning times when building the scope. Let us know about evening, weekend, event, or school schedules so we can review the available options.',
    },
    {
        question: 'What should I have ready when I call?',
        answer: 'Your building location, approximate square footage, type of property, and preferred cleaning frequency are helpful. You do not need a finished task list. Tell us what needs attention and we can work through the details together.',
    },
];

export default function HomeSections() {
    return (
        <div className="mcc-home-sections">
            <section id="services" className="mcc-home-services" aria-labelledby="home-services-title">
                <div className="mcc-home-wrap">
                    <div className="mcc-section-heading">
                        <div>
                            <p className="mcc-section-eyebrow">Built around your building</p>
                            <h2 id="home-services-title">Good cleaning starts<br />with the right scope.</h2>
                        </div>
                        <p className="mcc-section-intro">A busy office, a school campus, and a newly finished building need different plans. Let’s talk about yours.</p>
                    </div>
                    <div className="mcc-service-grid">
                        {services.map(({ number, Icon, title, description, tasks, href, link }) => (
                            <article className="mcc-service-item" key={number}>
                                <div className="mcc-service-top"><Icon size={30} strokeWidth={1.35} aria-hidden="true" /><span>{number}</span></div>
                                <h3>{title}</h3>
                                <p>{description}</p>
                                <p className="mcc-service-tasks">{tasks}</p>
                                <a href={href} className="mcc-text-link">{link}<ArrowUpRight size={19} aria-hidden="true" /></a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="mcc-home-process" aria-labelledby="home-process-title">
                <div className="mcc-home-wrap mcc-process-layout">
                    <div className="mcc-process-intro">
                        <p className="mcc-section-eyebrow">A straightforward place to start</p>
                        <h2 id="home-process-title">One less thing<br />on your list.</h2>
                        <p>When you are responsible for a building, the details add up. Restrooms. Entryways. Dust on the ledges. Start with a conversation about what needs attention and what a useful cleaning plan should cover.</p>
                        <a href="tel:+13252732203" className="mcc-call-link"><span className="mcc-call-icon"><Phone size={19} aria-hidden="true" /></span><span>Let’s talk about your building<strong>(325) 273 2203</strong></span><ArrowUpRight size={22} aria-hidden="true" /></a>
                    </div>
                    <ol className="mcc-process-steps">
                        {steps.map((step) => (
                            <li key={step.number}>
                                <span className="mcc-step-number" aria-hidden="true">{step.number}</span>
                                <div><h3>{step.title}</h3><p>{step.description}</p></div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section id="service-areas" className="mcc-home-coverage" aria-labelledby="home-coverage-title">
                <div className="mcc-home-wrap">
                    <div className="mcc-coverage-layout">
                        <div className="mcc-coverage-copy">
                            <p className="mcc-section-eyebrow">San Angelo is home</p>
                            <h2 id="home-coverage-title">Local people.<br />West Texas work.</h2>
                            <p>Master Commercial Clean serves San Angelo and the surrounding West Texas area directly. From a single office to a commercial property, we start by understanding the place you look after.</p>
                            <p>Tell us where your building is and what it needs. We will review the location and scope with you.</p>
                            <a href="/service-areas" className="mcc-text-link">Explore our service areas<ArrowUpRight size={19} aria-hidden="true" /></a>
                        </div>
                        <div className="mcc-coverage-place">
                            <span className="mcc-place-label"><MapPin size={17} aria-hidden="true" />Our home base</span>
                            <p className="mcc-place-name">San Angelo<span>Texas</span></p>
                            <div className="mcc-place-rule" aria-hidden="true"><span /></div>
                            <p className="mcc-place-caption">Serving businesses and buildings<br />across the West Texas communities we call home.</p>
                            <a href="#contact">Ask about your location<ArrowUpRight size={18} aria-hidden="true" /></a>
                        </div>
                    </div>
                    <aside className="mcc-network-note" aria-labelledby="home-network-title">
                        <div><p className="mcc-section-eyebrow">Looking beyond West Texas?</p><h3 id="home-network-title">Meet our Texas partner network.</h3><p>For established businesses in other Texas markets, we review your needs and seek a suitable local cleaning partner. Partner availability must be confirmed.</p></div>
                        <div className="mcc-network-links"><a href="/partner-network/greater-houston">Greater Houston<ArrowUpRight size={18} aria-hidden="true" /></a><a href="/partner-network/dallas-fort-worth">Dallas Fort Worth<ArrowUpRight size={18} aria-hidden="true" /></a></div>
                    </aside>
                </div>
            </section>

            <section id="guides" className="mcc-home-guides" aria-labelledby="home-guides-title">
                <div className="mcc-home-wrap">
                    <div className="mcc-section-heading">
                        <div><p className="mcc-section-eyebrow">Useful before you call</p><h2 id="home-guides-title">A little clarity<br />for your next decision.</h2></div>
                        <a href="/guides" className="mcc-text-link">All cleaning guides<ArrowUpRight size={19} aria-hidden="true" /></a>
                    </div>
                    <div className="mcc-guide-list">
                        {guides.map((guide, index) => (
                            <a className="mcc-guide-item" href={guide.href} key={guide.href}>
                                <span className="mcc-guide-number" aria-hidden="true">0{index + 1}</span>
                                <div><span className="mcc-guide-category">{guide.category}</span><h3>{guide.title}</h3><p>{guide.description}</p></div>
                                <span className="mcc-guide-arrow"><ArrowUpRight size={24} aria-hidden="true" /></span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="mcc-home-faq" aria-labelledby="home-faq-title">
                <div className="mcc-home-wrap mcc-faq-layout">
                    <div className="mcc-faq-intro"><p className="mcc-section-eyebrow">A few common questions</p><h2 id="home-faq-title">Let’s make<br />the next step easy.</h2><p>Have a question about your property? Give us a call and tell us what you are working with.</p><a href="tel:+13252732203" className="mcc-text-link"><Phone size={18} aria-hidden="true" />(325) 273 2203<ArrowUpRight size={19} aria-hidden="true" /></a></div>
                    <div className="mcc-faq-items">
                        {homeFaqs.map((faq) => (
                            <details key={faq.question} className="mcc-faq-item"><summary>{faq.question}<span aria-hidden="true" /></summary><p>{faq.answer}</p></details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
