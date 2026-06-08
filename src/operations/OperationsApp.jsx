import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Printer,
    UserCheck,
    X,
} from 'lucide-react';

const STORAGE_KEY = 'masterclean_operations_v2';
const LEGACY_STORAGE_KEY = 'masterclean_operations_v1';
const CLIENT_CODE = 'VBHS';

const workers = [
    { id: 'melissa-castillo', name: 'Melissa Castillo', shortName: 'Melissa' },
    { id: 'james-reynolds', name: 'James Reynolds', shortName: 'James' },
];

const locations = [
    {
        id: 'veribest-field-house',
        name: 'Veribest High School',
        facility: 'Field House',
        facilityLong: 'High School Field House',
        cityState: 'Veribest, Texas',
        contactName: 'Mandy Traylor',
        recurringRate: 125,
        approxSize: 'Per accepted scope',
    },
    {
        id: 'veribest-ag-classroom',
        name: 'Veribest Independent School District',
        facility: 'Agriculture Classroom',
        facilityLong: 'Agriculture Classroom',
        cityState: 'Veribest, Texas',
        contactName: 'Mandy Traylor',
        recurringRate: 125,
        approxSize: '~3,000 Sq Ft',
    },
];

const routePackage = {
    id: 'veribest-field-house-ag-route',
    clientCode: CLIENT_CODE,
    clientName: 'Veribest Independent School District',
    label: 'Veribest Field House + AG Classroom',
    facilityLabel: 'Field House + Agriculture Classroom',
    schedule: 'Tuesdays & Thursdays',
    contactName: 'Mandy Traylor',
    cityState: 'Veribest, Texas',
    locationIds: locations.map((location) => location.id),
    ratePerVisit: locations.reduce((total, location) => total + location.recurringRate, 0),
};

const DELETABLE_INVOICE_STATUSES = new Set(['draft', 'sent', 'overdue']);
const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue'];
const RETIRED_INVOICE_IDS = new Set(['inv-vbhs-003']);
const RETIRED_INVOICE_NUMBER_FLOOR = 3;

const defaultInvoices = [
    {
        id: 'inv-vbhs-002',
        invoiceNumber: 'VBHS-INV-002',
        locationId: 'veribest-field-house',
        servicePackageId: null,
        periodStart: '2026-04-20',
        periodEnd: '2026-05-07',
        subtotal: 750,
        tax: 0,
        total: 750,
        status: 'sent',
        issueDate: '2026-04-24',
        dueDate: '2026-05-15',
        paymentTerms: 'May district check run',
        serviceLabel: 'Recurring Cleanup Service',
        createdAt: '2026-04-24T12:00:00.000Z',
    },
    {
        id: 'inv-vbhs-001',
        invoiceNumber: 'VBHS-INV-001',
        locationId: 'veribest-field-house',
        servicePackageId: null,
        periodStart: '2026-04-01',
        periodEnd: '2026-04-22',
        subtotal: 500,
        tax: 0,
        total: 500,
        status: 'paid',
        issueDate: '2026-04-22',
        dueDate: '2026-05-07',
        paymentTerms: 'Net 15',
        serviceLabel: 'One-Time Deep Clean',
        createdAt: '2026-04-22T12:00:00.000Z',
    },
];

const defaultLineItems = [
    ...['2026-04-20', '2026-04-23', '2026-04-28', '2026-04-30', '2026-05-05', '2026-05-07'].map((visitDate) => ({
        id: `li-vbhs-002-${visitDate}`,
        invoiceId: 'inv-vbhs-002',
        description: `Cleanup Visit - Veribest High School Field House - ${formatLongDate(visitDate)}`,
        subtitle: '$125 Field House recurring cleanup',
        visitDate,
        workerId: '',
        qty: 1,
        rate: 125,
        amount: 125,
    })),
    {
        id: 'li-vbhs-001-1',
        invoiceId: 'inv-vbhs-001',
        description: 'Deep Clean - Veribest High School Field House',
        subtitle: 'Heavy-duty deep cleaning beyond standard maintenance scope: full floor service, trash and liners, locker exteriors, weight room, offices, and full restroom sanitization.',
        visitDate: '',
        workerId: '',
        qty: 1,
        rate: 500,
        amount: 500,
    },
];

const detailedScopeByLocation = {
    'veribest-field-house': [
        {
            title: 'GENERAL AREAS',
            rows: [
                'Swept and mopped floors throughout the field house',
                'Removed trash and replaced liners in all bins',
                'Dusted and wiped high-touch surfaces',
                'Reset visible common areas after service',
            ],
        },
        {
            title: 'LOCKER ROOMS & WEIGHT ROOM',
            rows: [
                'Cleaned locker exteriors and surrounding surfaces',
                'Detailed cleaning of weight room equipment surfaces and floors',
                'Disinfected high-contact athletic surfaces',
            ],
        },
        {
            title: 'RESTROOMS',
            rows: [
                'Deep cleaned and sanitized toilets, urinals, sinks, and counters',
                'Cleaned mirrors and fixture surfaces',
                'Mopped and disinfected restroom floors',
            ],
        },
        {
            title: 'OFFICES / COMMON AREAS',
            rows: [
                'Cleaned office surfaces and common areas',
                'Completed trash removal and detailed dusting throughout',
            ],
        },
    ],
    'veribest-ag-classroom': [
        {
            title: 'GENERAL AREAS',
            rows: [
                'Swept and mopped all floors throughout the agriculture classroom',
                'Trash removal and liner replacement in all bins',
                'Deep cleaning and dusting of surfaces, including countertops',
                'Detailed wipe-down of high-touch areas (door handles, light switches, rails)',
            ],
        },
        {
            title: 'LOCKER ROOMS & WEIGHT ROOM',
            rows: [
                'Deep cleaning of locker exteriors and surrounding surfaces',
                'Detailed cleaning of weight room equipment surfaces and floors',
                'Disinfecting of high-contact athletic surfaces',
            ],
        },
        {
            title: 'RESTROOMS',
            rows: [
                'Deep cleaned and sanitized all toilets and urinals',
                'Cleaned sinks, mirrors, and countertops',
                'Mopped and disinfected restroom floors',
            ],
        },
        {
            title: 'OFFICES / COMMON AREAS',
            rows: [
                'Deep cleaning of office surfaces and common areas',
                'Trash removal and detailed dusting throughout',
            ],
        },
    ],
};

const OperationsContext = createContext(null);

function todayInCentral() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function nextMonthlyCheckDate(dateString) {
    const [year, month] = dateString.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`;
}

function getCurrentMonthRange(dateString = todayInCentral()) {
    const [year, month] = dateString.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return {
        firstDay: `${year}-${month}-01`,
        lastDay: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
    };
}

function formatDate(dateString, options = {}) {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        ...options,
    }).format(new Date(`${dateString}T12:00:00`));
}

function formatLongDate(dateString) {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${dateString}T12:00:00`));
}

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

function getWorker(workerId) {
    return workers.find((worker) => worker.id === workerId);
}

function getLocation(locationId) {
    return locations.find((location) => location.id === locationId);
}

function getValidLocationIds(locationIds) {
    const requestedIds = Array.isArray(locationIds) ? locationIds : routePackage.locationIds;
    return routePackage.locationIds.filter((locationId) => requestedIds.includes(locationId));
}

function getVisitLocationIds(visitOrLocationIds) {
    const locationIds = Array.isArray(visitOrLocationIds) ? visitOrLocationIds : visitOrLocationIds?.locationIds;
    return getValidLocationIds(locationIds);
}

function getVisitLocations(visitOrLocationIds) {
    return getVisitLocationIds(visitOrLocationIds).map(getLocation).filter(Boolean);
}

function getLocationTotal(locationIds) {
    return getVisitLocations(locationIds).reduce((total, location) => total + Number(location.recurringRate || 0), 0);
}

function getVisitAmount(visit) {
    return Number(visit?.rate || getLocationTotal(visit?.locationIds) || routePackage.ratePerVisit);
}

function getFacilityLabel(locationIds) {
    const selectedLocations = getVisitLocations(locationIds);
    if (selectedLocations.length === routePackage.locationIds.length) return routePackage.facilityLabel;
    return selectedLocations.map((location) => location.facility).join(' + ') || routePackage.facilityLabel;
}

function getVisitSubtitle(locationIds) {
    return getVisitLocations(locationIds)
        .map((location) => `${formatMoney(location.recurringRate)} ${location.facility}`)
        .join(' + ');
}

function getEmptyRoomSelections() {
    return Object.fromEntries(routePackage.locationIds.map((locationId) => [locationId, false]));
}

function buildDefaultState() {
    return {
        visits: [],
        invoices: defaultInvoices,
        lineItems: defaultLineItems,
    };
}

function removeRetiredInvoices(state) {
    return {
        ...state,
        invoices: state.invoices.filter((invoice) => !RETIRED_INVOICE_IDS.has(invoice.id)),
        lineItems: state.lineItems.filter((item) => !RETIRED_INVOICE_IDS.has(item.invoiceId)),
    };
}

function mergeById(defaultItems, savedItems) {
    const merged = new Map(defaultItems.map((item) => [item.id, item]));
    if (Array.isArray(savedItems)) {
        savedItems.forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
    }
    return [...merged.values()];
}

function normalizeState(savedState) {
    const defaults = buildDefaultState();
    const visits = Array.isArray(savedState?.visits)
        ? savedState.visits.map((visit) => {
            const locationIds = getVisitLocationIds(visit);
            return {
                ...visit,
                locationIds,
                rate: Number(visit.rate || getLocationTotal(locationIds) || routePackage.ratePerVisit),
            };
        })
        : defaults.visits;

    return removeRetiredInvoices({
        visits,
        invoices: mergeById(defaults.invoices, savedState?.invoices),
        lineItems: mergeById(defaults.lineItems, savedState?.lineItems),
    });
}

function readSavedState() {
    if (typeof window === 'undefined') return buildDefaultState();

    try {
        const savedV2 = window.localStorage.getItem(STORAGE_KEY);
        if (savedV2) return normalizeState(JSON.parse(savedV2));

        const savedV1 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (savedV1) return normalizeState(JSON.parse(savedV1));
    } catch {
        return buildDefaultState();
    }

    return buildDefaultState();
}

function nextInvoiceNumber(invoices) {
    const lastNumber = invoices.reduce((max, invoice) => {
        const match = invoice.invoiceNumber?.match(/^VBHS-INV-(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
    }, RETIRED_INVOICE_NUMBER_FLOOR);

    return `${CLIENT_CODE}-INV-${String(lastNumber + 1).padStart(3, '0')}`;
}

function visitDescription(dateString, locationIds = routePackage.locationIds) {
    return `Cleanup Visit - ${getFacilityLabel(locationIds)} - ${formatLongDate(dateString)}`;
}

function recalculateInvoice(invoice, lineItems) {
    const subtotal = lineItems.reduce((total, item) => total + Number(item.amount || 0), 0);
    const tax = Number(invoice.tax || 0);
    const dates = lineItems.map((item) => item.visitDate).filter(Boolean).sort();

    return {
        ...invoice,
        subtotal,
        tax,
        total: subtotal + tax,
        periodStart: dates[0] || invoice.periodStart,
        periodEnd: dates[dates.length - 1] || invoice.periodEnd,
    };
}

export function OperationsProvider({ children }) {
    const [state, setState] = useState(readSavedState);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);

    const actions = useMemo(() => ({
        logVisit(workerId, visitDate = todayInCentral(), locationIds = routePackage.locationIds) {
            setState((current) => {
                const selectedLocationIds = getVisitLocationIds(locationIds);
                if (!selectedLocationIds.length) return current;

                const alreadyLogged = current.visits.some(
                    (visit) => visit.workerId === workerId && visit.visitDate === visitDate,
                );
                if (alreadyLogged) return current;

                const rate = getLocationTotal(selectedLocationIds);

                return {
                    ...current,
                    visits: [
                        ...current.visits,
                        {
                            id: `visit-${Date.now()}-${workerId}`,
                            servicePackageId: routePackage.id,
                            locationIds: selectedLocationIds,
                            workerId,
                            visitDate,
                            rate,
                            note: '',
                            createdAt: new Date().toISOString(),
                        },
                    ],
                };
            });
        },
        createInvoiceFromCurrentMonth() {
            let createdInvoice = null;

            setState((current) => {
                const { firstDay, lastDay } = getCurrentMonthRange();
                const invoicedVisitIds = new Set(current.lineItems.map((item) => item.visitId).filter(Boolean));
                const uninvoicedVisits = current.visits
                    .filter((visit) => visit.visitDate >= firstDay && visit.visitDate <= lastDay)
                    .filter((visit) => !invoicedVisitIds.has(visit.id))
                    .sort((a, b) => a.visitDate.localeCompare(b.visitDate));

                if (!uninvoicedVisits.length) return current;

                const invoiceId = `inv-${Date.now()}`;
                const issueDate = todayInCentral();
                const lineItems = uninvoicedVisits.map((visit) => {
                    const locationIds = getVisitLocationIds(visit);
                    const amount = getVisitAmount(visit);
                    const qty = locationIds.length || 1;

                    return {
                        id: `li-${Date.now()}-${visit.id}`,
                        invoiceId,
                        visitId: visit.id,
                        description: visitDescription(visit.visitDate, locationIds),
                        subtitle: getVisitSubtitle(locationIds),
                        visitDate: visit.visitDate,
                        workerId: visit.workerId,
                        qty,
                        rate: amount / qty,
                        amount,
                    };
                });

                createdInvoice = recalculateInvoice({
                    id: invoiceId,
                    invoiceNumber: nextInvoiceNumber(current.invoices),
                    locationId: null,
                    servicePackageId: routePackage.id,
                    periodStart: uninvoicedVisits[0].visitDate,
                    periodEnd: uninvoicedVisits[uninvoicedVisits.length - 1].visitDate,
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    status: 'draft',
                    issueDate,
                    dueDate: nextMonthlyCheckDate(issueDate),
                    paymentTerms: 'Monthly district check run',
                    serviceLabel: 'Recurring Cleanup Service',
                    createdAt: new Date().toISOString(),
                }, lineItems);

                return {
                    ...current,
                    invoices: [createdInvoice, ...current.invoices],
                    lineItems: [...current.lineItems, ...lineItems],
                };
            });

            return createdInvoice;
        },
        createManualInvoice(input) {
            let createdInvoice = null;

            setState((current) => {
                const amount = Number(input?.amount || 0);
                if (amount <= 0) return current;

                const tax = Number(input?.tax || 0);
                const issueDate = input?.issueDate || todayInCentral();
                const periodStart = input?.periodStart || issueDate;
                const periodEnd = input?.periodEnd || periodStart;
                const isRouteInvoice = input?.facilityId === routePackage.id;
                const locationId = isRouteInvoice ? null : input?.facilityId || locations[0].id;
                const servicePackageId = isRouteInvoice ? routePackage.id : null;
                const serviceLabel = input?.serviceLabel?.trim()
                    || (servicePackageId ? 'Recurring Cleanup Service' : 'One-Time Deep Clean');
                const status = INVOICE_STATUSES.includes(input?.status) ? input.status : 'draft';
                const invoiceId = `inv-${Date.now()}`;
                const facilityLabel = servicePackageId
                    ? routePackage.facilityLabel
                    : getLocation(locationId)?.facility || routePackage.facilityLabel;
                const description = input?.description?.trim() || `${serviceLabel} - ${facilityLabel}`;

                const lineItem = {
                    id: `li-${Date.now()}-manual`,
                    invoiceId,
                    description,
                    subtitle: '',
                    visitDate: '',
                    workerId: '',
                    qty: 1,
                    rate: amount,
                    amount,
                };

                createdInvoice = recalculateInvoice({
                    id: invoiceId,
                    invoiceNumber: nextInvoiceNumber(current.invoices),
                    locationId,
                    servicePackageId,
                    periodStart,
                    periodEnd,
                    subtotal: 0,
                    tax,
                    total: 0,
                    status,
                    issueDate,
                    dueDate: input?.dueDate || nextMonthlyCheckDate(issueDate),
                    paymentTerms: input?.paymentTerms?.trim() || 'Monthly district check run',
                    serviceLabel,
                    createdAt: new Date().toISOString(),
                }, [lineItem]);

                return {
                    ...current,
                    invoices: [createdInvoice, ...current.invoices],
                    lineItems: [...current.lineItems, lineItem],
                };
            });

            return createdInvoice;
        },
        updateInvoiceStatus(invoiceId, status) {
            setState((current) => ({
                ...current,
                invoices: current.invoices.map((invoice) => (
                    invoice.id === invoiceId ? { ...invoice, status } : invoice
                )),
            }));
        },
        deleteInvoice(invoiceId) {
            setState((current) => {
                const invoiceToDelete = current.invoices.find((invoice) => invoice.id === invoiceId);
                if (!invoiceToDelete || !DELETABLE_INVOICE_STATUSES.has(invoiceToDelete.status)) {
                    return current;
                }

                return {
                    ...current,
                    invoices: current.invoices.filter((invoice) => invoice.id !== invoiceId),
                    lineItems: current.lineItems.filter((item) => item.invoiceId !== invoiceId),
                };
            });
        },
    }), []);

    return (
        <OperationsContext.Provider value={{ state, actions }}>
            {children}
        </OperationsContext.Provider>
    );
}

function useOperations() {
    const context = useContext(OperationsContext);
    if (!context) {
        throw new Error('Operations pages must be wrapped in OperationsProvider');
    }
    return context;
}

export function OperationsLayout() {
    return (
        <main className="ops-app">
            <Helmet>
                <title>Operations | Master Commercial Clean</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <header className="ops-header">
                <Link className="ops-brand" to="/dashboard">
                    <span>Master Commercial Clean</span>
                    <strong>Operations</strong>
                </Link>
                <nav className="ops-nav" aria-label="Operations navigation">
                    <Link to="/checkin">Check-In</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/invoices">Invoices</Link>
                </nav>
            </header>
            <Outlet />
        </main>
    );
}

export function CheckInPage() {
    const { state, actions } = useOperations();
    const [message, setMessage] = useState('');
    const [activeWorker, setActiveWorker] = useState(null);
    const [roomSelections, setRoomSelections] = useState(getEmptyRoomSelections);
    const today = todayInCentral();
    const todayVisits = state.visits.filter((visit) => visit.visitDate === today);
    const selectedLocationIds = routePackage.locationIds.filter((locationId) => roomSelections[locationId]);
    const selectedTotal = getLocationTotal(selectedLocationIds);

    useEffect(() => {
        if (!activeWorker) return undefined;

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setActiveWorker(null);
                setRoomSelections(getEmptyRoomSelections());
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeWorker]);

    function openLogModal(worker) {
        setActiveWorker(worker);
        setRoomSelections(getEmptyRoomSelections());
        setMessage('');
    }

    function closeLogModal() {
        setActiveWorker(null);
        setRoomSelections(getEmptyRoomSelections());
    }

    function toggleRoom(locationId) {
        setRoomSelections((current) => ({
            ...current,
            [locationId]: !current[locationId],
        }));
    }

    function handleLog() {
        if (!activeWorker || !selectedLocationIds.length) return;

        actions.logVisit(activeWorker.id, today, selectedLocationIds);
        setMessage(`Thanks ${activeWorker.shortName} - logged ${getFacilityLabel(selectedLocationIds)} for ${formatMoney(selectedTotal)}.`);
        closeLogModal();
    }

    return (
        <section className="ops-page ops-checkin">
            <div className="ops-page-title">
                <p>{formatLongDate(today)}</p>
                <h1>Veribest Field House + AG Classroom Cleanup Check In</h1>
            </div>

            {message && (
                <div className="ops-success">
                    <CheckCircle2 size={18} /> {message}
                </div>
            )}

            <div className="ops-route-card">
                <strong>{routePackage.facilityLabel}</strong>
                <span>{formatMoney(125)} per selected room, {formatMoney(routePackage.ratePerVisit)} when both are checked</span>
            </div>

            <div className="ops-worker-grid">
                {workers.map((worker) => {
                    const alreadyLogged = todayVisits.some((visit) => visit.workerId === worker.id);
                    return (
                        <button
                            className="ops-worker-button"
                            type="button"
                            disabled={alreadyLogged}
                            onClick={() => openLogModal(worker)}
                            key={worker.id}
                        >
                            <UserCheck size={30} />
                            <span>{worker.shortName}</span>
                            <strong>{alreadyLogged ? 'Already checked in today' : 'I cleaned today'}</strong>
                        </button>
                    );
                })}
            </div>

            <section className="ops-panel">
                <h2>Today's Check-Ins</h2>
                {todayVisits.length ? (
                    <ul className="ops-list">
                        {todayVisits.map((visit) => (
                            <li key={visit.id}>
                                <span>
                                    {getWorker(visit.workerId)?.name}
                                    <small>{getFacilityLabel(visit.locationIds)}</small>
                                </span>
                                <strong>{formatMoney(getVisitAmount(visit))}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="ops-muted">No one has checked in yet today.</p>
                )}
            </section>

            {activeWorker && (
                <div
                    className="ops-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeLogModal();
                    }}
                >
                    <div
                        aria-labelledby="ops-room-modal-title"
                        aria-modal="true"
                        className="ops-modal"
                        role="dialog"
                    >
                        <div className="ops-modal-header">
                            <div>
                                <span>Rooms cleaned today</span>
                                <h2 id="ops-room-modal-title">{activeWorker.shortName}'s check-in</h2>
                            </div>
                            <button
                                aria-label="Close room selection"
                                className="ops-icon-button"
                                type="button"
                                onClick={closeLogModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ops-room-options">
                            {locations.map((location) => {
                                const checked = Boolean(roomSelections[location.id]);

                                return (
                                    <label className={`ops-room-option ${checked ? 'is-selected' : ''}`} key={location.id}>
                                        <input
                                            checked={checked}
                                            type="checkbox"
                                            onChange={() => toggleRoom(location.id)}
                                        />
                                        <span className="ops-room-check" aria-hidden="true">
                                            {checked ? <CheckCircle2 size={18} /> : <Building2 size={18} />}
                                        </span>
                                        <span>
                                            <strong>{location.facility}</strong>
                                            <small>{formatMoney(location.recurringRate)} per room</small>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="ops-payment-preview">
                            <span>
                                {selectedLocationIds.length
                                    ? `${selectedLocationIds.length} room${selectedLocationIds.length === 1 ? '' : 's'} selected`
                                    : 'No rooms selected'}
                            </span>
                            <strong>{formatMoney(selectedTotal)}</strong>
                        </div>

                        <div className="ops-modal-actions">
                            <button className="ops-secondary-action" type="button" onClick={closeLogModal}>
                                Cancel
                            </button>
                            <button
                                className="ops-primary-action"
                                type="button"
                                disabled={!selectedLocationIds.length}
                                onClick={handleLog}
                            >
                                Log {formatMoney(selectedTotal)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export function DashboardPage() {
    const { state, actions } = useOperations();
    const navigate = useNavigate();
    const { firstDay, lastDay } = getCurrentMonthRange();
    const monthVisits = state.visits
        .filter((visit) => visit.visitDate >= firstDay && visit.visitDate <= lastDay)
        .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    const invoicedVisitIds = new Set(state.lineItems.map((item) => item.visitId).filter(Boolean));
    const uninvoicedVisits = monthVisits.filter((visit) => !invoicedVisitIds.has(visit.id));
    const runningTotal = uninvoicedVisits.reduce(
        (total, visit) => total + getVisitAmount(visit),
        0,
    );

    function generateInvoice() {
        const invoice = actions.createInvoiceFromCurrentMonth();
        setTimeout(() => {
            if (invoice) navigate(`/invoices/${invoice.id}`);
        }, 0);
    }

    return (
        <section className="ops-page">
            <div className="ops-page-title ops-title-row">
                <div>
                    <p>{routePackage.label}</p>
                    <h1>This Month at Veribest</h1>
                </div>
                <Link className="ops-link-button" to="/invoices">View all invoices</Link>
            </div>

            <div className="ops-stats">
                <article className="ops-stat">
                    <CalendarDays size={24} />
                    <span>Uninvoiced Route Visits</span>
                    <strong>{uninvoicedVisits.length}</strong>
                </article>
                <article className="ops-stat">
                    <ClipboardList size={24} />
                    <span>Running Total</span>
                    <strong>{formatMoney(runningTotal)}</strong>
                    <small>$125 per selected room</small>
                </article>
                <button
                    className="ops-primary-action"
                    type="button"
                    disabled={!uninvoicedVisits.length}
                    onClick={generateInvoice}
                >
                    Generate Invoice for Mandy
                </button>
            </div>

            <section className="ops-panel">
                <h2>Visits This Month</h2>
                {monthVisits.length ? (
                    <ul className="ops-list">
                        {monthVisits.map((visit) => (
                            <li key={visit.id}>
                                <span>
                                    {formatDate(visit.visitDate)} - {getWorker(visit.workerId)?.name}
                                    <small>{getFacilityLabel(visit.locationIds)}</small>
                                </span>
                                <strong>{invoicedVisitIds.has(visit.id) ? 'Invoiced' : formatMoney(getVisitAmount(visit))}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="ops-muted">No visits have been logged this month yet.</p>
                )}
            </section>
        </section>
    );
}

export function InvoiceListPage() {
    const { state, actions } = useOperations();
    const navigate = useNavigate();
    const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
    const invoices = [...state.invoices].sort((a, b) => {
        const dateSort = b.issueDate.localeCompare(a.issueDate);
        return dateSort || b.invoiceNumber.localeCompare(a.invoiceNumber);
    });
    const paidTotal = state.invoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((total, invoice) => total + Number(invoice.total || 0), 0);
    const outstandingTotal = state.invoices
        .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
        .reduce((total, invoice) => total + Number(invoice.total || 0), 0);
    const lifetimeBilled = paidTotal + outstandingTotal;

    function handleCreateInvoice(input) {
        const invoice = actions.createManualInvoice(input);
        setIsNewInvoiceOpen(false);
        setTimeout(() => {
            if (invoice) navigate(`/invoices/${invoice.id}`);
        }, 0);
    }

    return (
        <section className="ops-page">
            <div className="ops-page-title ops-title-row">
                <div>
                    <h1>Invoices</h1>
                    <p>Every invoice you've ever generated, with status.</p>
                </div>
                <div className="ops-title-actions">
                    <Link className="ops-link-button" to="/dashboard">Back to dashboard</Link>
                    <button className="ops-primary-action" type="button" onClick={() => setIsNewInvoiceOpen(true)}>
                        New Invoice
                    </button>
                </div>
            </div>

            <div className="ops-invoice-summary">
                <article>
                    <span>Lifetime Billed</span>
                    <strong>{formatMoney(lifetimeBilled)}</strong>
                </article>
                <article>
                    <span>Paid</span>
                    <strong className="is-paid">{formatMoney(paidTotal)}</strong>
                </article>
                <article>
                    <span>Outstanding</span>
                    <strong className="is-outstanding">{formatMoney(outstandingTotal)}</strong>
                </article>
            </div>

            <div className="ops-table-wrap">
                <table className="ops-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Issued</th>
                            <th>Period</th>
                            <th>Facility</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{formatDate(invoice.issueDate)}</td>
                                <td>{formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}</td>
                                <td>{getInvoiceListFacility(invoice)}</td>
                                <td>{formatMoney(invoice.total)}</td>
                                <td><StatusBadge status={invoice.status} /></td>
                                <td>
                                    <div className="ops-actions">
                                        <Link to={`/invoices/${invoice.id}`}>View</Link>
                                        <Link to={`/invoices/${invoice.id}`}>Edit Invoice</Link>
                                        {invoice.status === 'draft' && (
                                            <button type="button" onClick={() => actions.updateInvoiceStatus(invoice.id, 'sent')}>
                                                Mark Sent
                                            </button>
                                        )}
                                        {invoice.status !== 'paid' && (
                                            <button type="button" onClick={() => actions.updateInvoiceStatus(invoice.id, 'paid')}>
                                                Mark Paid
                                            </button>
                                        )}
                                        {DELETABLE_INVOICE_STATUSES.has(invoice.status) && (
                                            <button type="button" onClick={() => actions.deleteInvoice(invoice.id)}>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isNewInvoiceOpen && (
                <ManualInvoiceModal
                    onClose={() => setIsNewInvoiceOpen(false)}
                    onCreate={handleCreateInvoice}
                />
            )}
        </section>
    );
}

function ManualInvoiceModal({ onClose, onCreate }) {
    const currentDate = todayInCentral();
    const [form, setForm] = useState(() => ({
        facilityId: routePackage.id,
        serviceLabel: 'Recurring Cleanup Service',
        issueDate: currentDate,
        dueDate: nextMonthlyCheckDate(currentDate),
        periodStart: currentDate,
        periodEnd: currentDate,
        paymentTerms: 'Monthly district check run',
        amount: '',
        tax: '0',
        status: 'draft',
        description: '',
    }));
    const [error, setError] = useState('');

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') onClose();
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    function updateField(field, value) {
        setError('');
        setForm((current) => {
            if (field !== 'facilityId') return { ...current, [field]: value };

            const isRouteInvoice = value === routePackage.id;
            return {
                ...current,
                facilityId: value,
                serviceLabel: isRouteInvoice ? 'Recurring Cleanup Service' : 'One-Time Deep Clean',
                paymentTerms: isRouteInvoice ? 'Monthly district check run' : 'Net 15',
            };
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const amount = Number(form.amount);
        const tax = Number(form.tax || 0);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError('Enter an amount greater than $0.');
            return;
        }

        if (!Number.isFinite(tax) || tax < 0) {
            setError('Enter a valid tax amount.');
            return;
        }

        if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
            setError('The period end date must be after the start date.');
            return;
        }

        onCreate({ ...form, amount, tax });
    }

    return (
        <div
            className="ops-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <form
                aria-labelledby="ops-manual-invoice-title"
                aria-modal="true"
                className="ops-modal ops-modal-wide"
                role="dialog"
                onSubmit={handleSubmit}
            >
                <div className="ops-modal-header">
                    <div>
                        <span>Manual invoice</span>
                        <h2 id="ops-manual-invoice-title">New invoice</h2>
                    </div>
                    <button
                        aria-label="Close invoice form"
                        className="ops-icon-button"
                        type="button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="ops-form-grid">
                    <label className="ops-field">
                        <span>Facility</span>
                        <select
                            value={form.facilityId}
                            onChange={(event) => updateField('facilityId', event.target.value)}
                        >
                            <option value={routePackage.id}>{routePackage.facilityLabel}</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.facility}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="ops-field">
                        <span>Status</span>
                        <select
                            value={form.status}
                            onChange={(event) => updateField('status', event.target.value)}
                        >
                            {INVOICE_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="ops-field">
                        <span>Invoice date</span>
                        <input
                            type="date"
                            value={form.issueDate}
                            onChange={(event) => updateField('issueDate', event.target.value)}
                        />
                    </label>

                    <label className="ops-field">
                        <span>Due date</span>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(event) => updateField('dueDate', event.target.value)}
                        />
                    </label>

                    <label className="ops-field">
                        <span>Period start</span>
                        <input
                            type="date"
                            value={form.periodStart}
                            onChange={(event) => updateField('periodStart', event.target.value)}
                        />
                    </label>

                    <label className="ops-field">
                        <span>Period end</span>
                        <input
                            type="date"
                            value={form.periodEnd}
                            onChange={(event) => updateField('periodEnd', event.target.value)}
                        />
                    </label>

                    <label className="ops-field">
                        <span>Amount</span>
                        <input
                            min="0"
                            step="0.01"
                            type="number"
                            value={form.amount}
                            onChange={(event) => updateField('amount', event.target.value)}
                        />
                    </label>

                    <label className="ops-field">
                        <span>Tax</span>
                        <input
                            min="0"
                            step="0.01"
                            type="number"
                            value={form.tax}
                            onChange={(event) => updateField('tax', event.target.value)}
                        />
                    </label>

                    <label className="ops-field ops-field-wide">
                        <span>Service</span>
                        <input
                            type="text"
                            value={form.serviceLabel}
                            onChange={(event) => updateField('serviceLabel', event.target.value)}
                        />
                    </label>

                    <label className="ops-field ops-field-wide">
                        <span>Line item</span>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                        />
                    </label>

                    <label className="ops-field ops-field-wide">
                        <span>Payment terms</span>
                        <input
                            type="text"
                            value={form.paymentTerms}
                            onChange={(event) => updateField('paymentTerms', event.target.value)}
                        />
                    </label>
                </div>

                {error && <p className="ops-error">{error}</p>}

                <div className="ops-modal-actions">
                    <button className="ops-secondary-action" type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="ops-primary-action" type="submit">
                        Create Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}

export function InvoiceDetailPage() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const { state, actions } = useOperations();
    const invoice = state.invoices.find((item) => item.id === invoiceId);
    const lineItems = state.lineItems.filter((item) => item.invoiceId === invoiceId);

    if (!invoice) {
        return (
            <section className="ops-page">
                <div className="ops-panel">
                    <h1>Invoice not found</h1>
                    <p className="ops-muted">This invoice is not saved in this browser.</p>
                    <Link className="ops-link-button" to="/invoices">Back to invoices</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="ops-page">
            <div className="ops-toolbar">
                <Link to="/invoices">Back to list</Link>
                <button type="button" onClick={() => window.print()}>
                    <Printer size={16} /> Print / Save PDF
                </button>
                {invoice.status === 'draft' && (
                    <button type="button" onClick={() => actions.updateInvoiceStatus(invoice.id, 'sent')}>
                        Mark as Sent
                    </button>
                )}
                {invoice.status !== 'paid' && (
                    <button type="button" onClick={() => actions.updateInvoiceStatus(invoice.id, 'paid')}>
                        Mark as Paid
                    </button>
                )}
                {DELETABLE_INVOICE_STATUSES.has(invoice.status) && (
                    <button
                        type="button"
                        onClick={() => {
                            actions.deleteInvoice(invoice.id);
                            navigate('/invoices');
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>
            <InvoiceDocument invoice={invoice} lineItems={lineItems} />
        </section>
    );
}

function StatusBadge({ status }) {
    return <span className={`ops-status ops-status-${status}`}>{status}</span>;
}

function getInvoiceFacility(invoice) {
    if (invoice.servicePackageId === routePackage.id) return routePackage.facilityLabel;
    return getLocation(invoice.locationId)?.facility || routePackage.facilityLabel;
}

function getInvoiceListFacility(invoice) {
    if (invoice.servicePackageId === routePackage.id) {
        return `Veribest High School - ${routePackage.facilityLabel}`;
    }

    const location = getLocation(invoice.locationId);
    if (!location) return routePackage.facilityLabel;
    return `${location.name} - ${location.facility}`;
}

function getInvoiceClient(invoice) {
    if (invoice.servicePackageId === routePackage.id) {
        return {
            name: routePackage.clientName,
            facility: routePackage.facilityLabel,
            cityState: routePackage.cityState,
            contactName: routePackage.contactName,
        };
    }

    const location = getLocation(invoice.locationId) || locations[0];
    return {
        name: location.name,
        facility: location.facility,
        cityState: location.cityState,
        contactName: location.contactName,
    };
}

function InvoiceDocument({ invoice, lineItems }) {
    const isRecurring = invoice.serviceLabel === 'Recurring Cleanup Service';
    const client = getInvoiceClient(invoice);
    const location = getLocation(invoice.locationId);
    const scopeGroups = isRecurring ? [] : detailedScopeByLocation[invoice.locationId] || [];

    return (
        <article className="mc-invoice-document">
            <header className="mc-invoice-header">
                <div className="mc-invoice-logo">
                    <img src="/img/logo.png" alt="Master Commercial Clean" />
                </div>
                <div className="mc-invoice-title">
                    <h1>Invoice</h1>
                    <p>Invoice # {invoice.invoiceNumber} &nbsp;|&nbsp; {formatDate(invoice.issueDate)}</p>
                </div>
            </header>

            <section className="mc-info-row">
                <div className="mc-info-col">
                    <h2>From</h2>
                    <p><span>Name</span><strong>John W. Johnson</strong></p>
                    <p><span>Company</span><b>Master Commercial Clean</b></p>
                    <p><span>Phone</span><b>325-273-2203</b></p>
                    <p><span>Email</span><b>john@mastercleanhq.com</b></p>
                </div>
                <div className="mc-info-col">
                    <h2>Bill To</h2>
                    <p><span>Business</span><strong>{client.name}</strong></p>
                    <p><span>Facility</span><b>{client.facility}</b></p>
                    <p><span>Contact</span><b>{client.contactName}</b></p>
                    <p><span>Location</span><b>{client.cityState}</b></p>
                </div>
            </section>

            <section className="mc-info-row mc-info-row-tight">
                <div className="mc-info-col">
                    <h2>Service Overview</h2>
                    <p><span>Service</span><b>{invoice.serviceLabel}</b></p>
                    <p><span>Facility</span><b>{getInvoiceFacility(invoice)}</b></p>
                    <p><span>{isRecurring ? 'Schedule' : 'Approx. Size'}</span><b>{isRecurring ? routePackage.schedule : location?.approxSize || 'Per accepted scope'}</b></p>
                    <p><span>{isRecurring ? 'Period' : 'Date Performed'}</span><b>{isRecurring ? `${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}` : formatDate(invoice.periodStart)}</b></p>
                </div>
                <div className="mc-info-col">
                    <h2>Payment</h2>
                    <p><span>Invoice Date</span><b>{formatDate(invoice.issueDate)}</b></p>
                    <p><span>Terms</span><b>{invoice.paymentTerms || 'Net 15'}</b></p>
                    <p><span>Due Date</span><strong>{formatDate(invoice.dueDate)}</strong></p>
                    <p><span>Amount Due</span><strong>{formatMoney(invoice.total)}</strong></p>
                </div>
            </section>

            {!isRecurring && Boolean(scopeGroups.length) && (
                <>
                    <div className="mc-section-bar">Scope Of Work Completed</div>
                    {scopeGroups.map((group) => (
                        <section className="mc-scope-group" key={group.title}>
                            <h3>{group.title}</h3>
                            <div>
                                {group.rows.map((row) => (
                                    <p key={row}><span>&bull;</span>{row}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </>
            )}

            <div className="mc-section-bar">Charges</div>
            <table className="mc-charges">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <strong>{item.description}</strong>
                                {item.subtitle && <span>{item.subtitle}</span>}
                                {item.workerId && <span>Completed by {getWorker(item.workerId)?.name}</span>}
                            </td>
                            <td>{item.qty}</td>
                            <td>{formatMoney(item.rate)}</td>
                            <td>{formatMoney(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <section className="mc-totals">
                <div>
                    <p><span>Subtotal</span><strong>{formatMoney(invoice.subtotal)}</strong></p>
                    <p><span>Tax</span><strong>{formatMoney(invoice.tax)}</strong></p>
                    <p><span>Total Due</span><strong>{formatMoney(invoice.total)}</strong></p>
                </div>
            </section>

            <section className="mc-pay-row">
                <div>
                    <h3>Payment Instructions</h3>
                    <p>Make checks payable to: <strong>John W. Johnson</strong></p>
                    <p>For questions about this invoice, contact John directly:</p>
                    <p>325-273-2203 &nbsp;|&nbsp; john@mastercleanhq.com</p>
                </div>
                <div>
                    <h3>Amount &amp; Due Date</h3>
                    <p>Amount Due: <strong className="mc-due">{formatMoney(invoice.total)}</strong></p>
                    <p>Due Date: <strong>{formatDate(invoice.dueDate)}</strong></p>
                    <p>Payment Terms: {invoice.paymentTerms || 'Net 15'}</p>
                </div>
            </section>

            <section className="mc-terms">
                <h4>Terms &amp; Notes</h4>
                <ul>
                    <li>Payment due by the due date shown above.</li>
                    <li>Please reference Invoice # {invoice.invoiceNumber} with payment.</li>
                    <li>Thank you for the opportunity to serve {client.name}.</li>
                </ul>
            </section>

            <footer className="mc-footer">
                <p>Thank you, Mandy - it was a pleasure serving the {client.facility}.</p>
                <strong>Master Commercial Clean &nbsp;|&nbsp; 325-273-2203 &nbsp;|&nbsp; john@mastercleanhq.com &nbsp;|&nbsp; mastercleanhq.com</strong>
            </footer>
        </article>
    );
}
