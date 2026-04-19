import React from "react";

const Pagination = ({page,totalPages,setPage}) => {
    const pageButtons = [];
    for(let i=1; i<= totalPages; i++)
    {
        pageButtons.push(
            <button key={i} onClick={()=> setPage(i)} disabled={page === i}>
                {i}
            </button>
        )
    }
return(
    <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
        {pageButtons}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
    </div>
)
}

export default Pagination;