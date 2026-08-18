const GENRES = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi',
    'Thriller', 'War'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const SORT_OPTIONS = [
    { value: 'trending', label: 'Trending' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'year', label: 'Newest' },
];

const FilterBar = ({ genre, year, sort, onFilterChange }) => {
    return (
        <div style={styles.bar}>
            <div style={styles.field}>
                <label style={styles.label}>Genre:</label>
                <select
                    value={genre}
                    onChange={(e) => onFilterChange('genre', e.target.value)}
                    style={styles.select}
                >
                    <option value="">- All -</option>
                    {GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Year:</label>
                <select
                    value={year}
                    onChange={(e) => onFilterChange('year', e.target.value)}
                    style={styles.select}
                >
                    <option value="">- All -</option>
                    {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Sort by:</label>
                <select
                    value={sort}
                    onChange={(e) => onFilterChange('sort', e.target.value)}
                    style={styles.select}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const styles = {
    bar: {
        backgroundColor: '#141414',
        padding: '18px 5%',
        display: 'flex',
        gap: '28px',
        flexWrap: 'wrap',
        rowGap: '14px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: '#ccc',
        fontSize: '13px',
        fontWeight: 600,
    },
    select: {
        backgroundColor: '#1f1f1f',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '14px',
        minWidth: '140px',
        cursor: 'pointer',
        outline: 'none',
    },
};

export default FilterBar;
