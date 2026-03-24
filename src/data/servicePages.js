import { PHONE_DISPLAY, PRIMARY_SERVICE_CITIES } from '../config/site';

export const servicePages = [
    {
        slug: 'commercial-cleaning',
        navLabel: 'Commercial Cleaning',
        title: 'Commercial Cleaning Services in West Texas',
        seoTitle: 'Commercial Cleaning Services in West Texas | Master Commercial Clean',
        description: `Professional commercial cleaning for offices, retail spaces, banks, and shared workspaces across ${PRIMARY_SERVICE_CITIES.join(', ')}. Request a quote from Master Commercial Clean today.`,
        eyebrow: 'Routine Janitorial Support',
        question: 'What does commercial cleaning include in West Texas?',
        answer: 'Commercial cleaning includes scheduled restroom sanitation, floor care, trash removal, breakroom cleaning, dusting, and recurring touchpoint disinfection tailored to the needs of the building.',
        intro: `Master Commercial Clean provides recurring commercial cleaning for offices, storefronts, and business facilities across ${PRIMARY_SERVICE_CITIES.join(', ')}. We build dependable cleaning schedules, clear scopes of work, and quality-control routines that keep your workplace presentable every day.`,
        summary: 'Our commercial cleaning programs are designed for businesses that need consistent presentation, sanitation, and after-hours reliability without micromanaging the cleaning crew.',
        bullets: [
            'Nightly, weekly, and custom cleaning schedules',
            'Restroom sanitation, breakroom cleaning, and trash removal',
            'Floor care, touchpoint disinfection, and lobby upkeep',
            'Flexible service for offices, banks, retail, and professional suites',
        ],
        industries: [
            'Corporate offices',
            'Retail stores',
            'Banks and financial branches',
            'Medical-adjacent reception areas',
            'Property management common areas',
            'Professional service firms',
        ],
        outcomes: [
            'Cleaner daily presentation for staff and visitors',
            'Lower risk of missed tasks through documented routines',
            'Service schedules that fit around operating hours',
        ],
        faqs: [
            {
                question: 'What does a commercial cleaning plan usually include?',
                answer: 'Most plans include restroom cleaning, breakroom cleaning, trash removal, vacuuming, mopping, dusting, glass touch-ups, and recurring disinfection based on traffic and facility type.',
            },
            {
                question: 'Can you clean after business hours?',
                answer: 'Yes. We regularly schedule service for evenings, nights, weekends, and other low-disruption time windows for West Texas businesses.',
            },
            {
                question: 'How do you price commercial cleaning?',
                answer: `Pricing depends on square footage, frequency, traffic, and scope. We provide a site walk-through and a clear quote before service starts. Call ${PHONE_DISPLAY} to schedule one.`,
            },
        ],
    },
    {
        slug: 'post-construction-cleaning',
        navLabel: 'Post-Construction Cleanup',
        title: 'Post-Construction Cleaning in West Texas',
        seoTitle: 'Post-Construction Cleaning in West Texas | Master Commercial Clean',
        description: `Detailed post-construction cleanup for contractors, owners, and property managers across ${PRIMARY_SERVICE_CITIES.join(', ')}. Dust removal, surface detailing, and turnover-ready cleaning.`,
        eyebrow: 'Turnover-Ready Cleanup',
        question: 'How does post-construction cleaning work in West Texas?',
        answer: 'Post-construction cleanup focuses on fine dust removal, residue cleanup, fixture detailing, and final presentation so the space is ready for inspections, turnover, or occupancy.',
        intro: `We handle post-construction cleanup for remodels, tenant improvements, and new commercial spaces across ${PRIMARY_SERVICE_CITIES.join(', ')}. Our crews remove debris residue, fine dust, and jobsite buildup so the space is inspection-ready and move-in ready.`,
        summary: 'This service is built for contractors and owners who need a polished final presentation without slowing down closeout timelines.',
        bullets: [
            'Fine dust removal from horizontal and vertical surfaces',
            'Window, trim, fixture, and baseboard detailing',
            'Floor cleanup for turnover and punch-list readiness',
            'Flexible scheduling around final walkthroughs and closeout deadlines',
        ],
        industries: [
            'Office build-outs',
            'Retail tenant improvements',
            'Medical and professional remodels',
            'Commercial shell completion',
            'Property turnover projects',
        ],
        outcomes: [
            'Cleaner handoff for owners, tenants, and inspectors',
            'Reduced closeout friction from leftover dust and residue',
            'A final finish that matches the quality of the build',
        ],
        faqs: [
            {
                question: 'Do you remove construction debris?',
                answer: 'We handle cleaning-related debris and residue removal as part of final cleanup. If a project needs heavy hauling or dumpster coordination, we can identify that during the walkthrough.',
            },
            {
                question: 'Can you work around punch-list completion?',
                answer: 'Yes. We can schedule around final trade work and return for touch-up cleaning when the project is ready for turnover.',
            },
            {
                question: 'What is different about post-construction cleaning?',
                answer: 'It is more detailed than routine janitorial work. The focus is on fine dust, residue, adhesive traces, polishing, and preparing the space for inspection or occupancy.',
            },
        ],
    },
    {
        slug: 'specialized-cleaning',
        navLabel: 'Specialized Cleaning',
        title: 'Specialized Cleaning Services in West Texas',
        seoTitle: 'Specialized Cleaning Services in West Texas | Master Commercial Clean',
        description: `Specialized commercial cleaning for high-traffic, high-sensitivity, and non-routine situations across ${PRIMARY_SERVICE_CITIES.join(', ')}. Built for facilities that need more than standard janitorial service.`,
        eyebrow: 'High-Need Cleaning Support',
        question: 'What specialized cleaning services are available in West Texas?',
        answer: 'Specialized cleaning covers deeper sanitation, higher-detail work, facility resets, custom scopes, and cleaning plans built for more sensitive or demanding environments.',
        intro: `Our specialized cleaning service covers facilities and situations that need tighter sanitation standards, deeper detail, or a more customized operating plan. We support businesses across ${PRIMARY_SERVICE_CITIES.join(', ')} with site-specific cleaning scopes that go beyond standard janitorial work.`,
        summary: 'This is the right fit when the building, workflow, or sanitation requirement is too specific for an off-the-shelf cleaning package.',
        bullets: [
            'High-touch sanitation and targeted disinfection',
            'Deep cleaning for move-ins, move-outs, and resets',
            'Custom scopes for warehouses, clinics, and specialty spaces',
            'Escalated detail for high-traffic zones and problem areas',
        ],
        industries: [
            'Medical-adjacent environments',
            'Industrial and warehouse spaces',
            'Event and facility resets',
            'Move-in and move-out transitions',
            'High-traffic common areas',
        ],
        outcomes: [
            'More precise cleaning where routine service is not enough',
            'Better sanitation outcomes in sensitive or high-traffic areas',
            'A custom scope built around the actual operating risk',
        ],
        faqs: [
            {
                question: 'What counts as specialized cleaning?',
                answer: 'Specialized cleaning includes projects or facilities that need deeper sanitation, unusual workflows, custom scopes, or higher-detail attention than standard recurring service.',
            },
            {
                question: 'Can you build a custom cleaning scope?',
                answer: 'Yes. We can tailor the frequency, task list, and quality-control checkpoints to your building type, operating hours, and sanitation priorities.',
            },
            {
                question: 'Is specialized cleaning only for emergencies?',
                answer: 'No. It can be one-time, short-term, or recurring. Many facilities use it for periodic resets, inspections, occupancy changes, or higher-risk cleaning needs.',
            },
        ],
    },
];

export function getServicePageBySlug(slug) {
    return servicePages.find((service) => service.slug === slug);
}
