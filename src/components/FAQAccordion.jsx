const FAQAccordion = ({ faqs, title = 'Frequently Asked Questions' }) => {
    if (!faqs?.length) return null;
    return (
        <section className="mcc-accordion">
            {title && <h2 data-motion="rise">{title}</h2>}
            <div>
                {faqs.map((faq, index) => (
                    <details className="mcc-accordion-item" key={index}>
                        <summary><span>{faq.question || faq.q}</span><span className="mcc-accordion-mark" aria-hidden="true" /></summary>
                        <p>{faq.answer || faq.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
};

export default FAQAccordion;
