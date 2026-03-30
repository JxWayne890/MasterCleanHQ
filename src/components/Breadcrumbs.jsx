import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
    return (
        <nav aria-label="Breadcrumb" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
        }}>
            <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((item, index) => (
                    <li key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {index > 0 && <span style={{ color: 'var(--orange)' }}>/</span>}
                        {index === items.length - 1 ? (
                            <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{item.name}</span>
                        ) : (
                            <Link to={item.path} style={{
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                transition: 'color 0.3s',
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--orange)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                {item.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
