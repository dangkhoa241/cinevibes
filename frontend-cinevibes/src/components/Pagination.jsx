import React from "react";

const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxButtons = 5;

        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);

        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div style={styles.container}>
            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={page === 1 ? styles.disabledBtn : styles.navBtn}
            >
                Prev
            </button>

            {/* Always show page 1 if not in range */}
            {getPageNumbers()[0] > 1 && (
                <>
                    <button onClick={() => setPage(1)} style={styles.button}>1</button>
                    <span style={styles.ellipsis}>...</span>
                </>
            )}

            {getPageNumbers().map((num) => (
                <button
                    key={num}
                    onClick={() => setPage(num)}
                    style={page === num ? styles.activeButton : styles.button}
                >
                    {num}
                </button>
            ))}

            {/* Always show last page if not in range */}
            {getPageNumbers().reverse()[0] < totalPages && (
                <>
                    <span style={styles.ellipsis}>...</span>
                    <button onClick={() => setPage(totalPages)} style={styles.button}>
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={page === totalPages ? styles.disabledBtn : styles.navBtn}
            >
                Next
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        margin: '40px 0',
        flexWrap: 'wrap'
    },
    button: {
        padding: '8px 14px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        borderRadius: '4px'
    },
    activeButton: {
        padding: '8px 14px',
        border: '1px solid #e50914',
        backgroundColor: '#e50914',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '4px'
    },
    navBtn: {
        padding: '8px 14px',
        backgroundColor: '#eee',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    disabledBtn: {
        padding: '8px 14px',
        backgroundColor: '#f9f9f9',
        color: '#ccc',
        border: '1px solid #eee',
        cursor: 'not-allowed',
        borderRadius: '4px'
    },
    ellipsis: {
        padding: '0 5px',
        color: '#888'
    }
};

export default Pagination;