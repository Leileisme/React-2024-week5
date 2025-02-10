const Pagination = (props) => {
  const {
    pagination,
    handlePageClick
  } = props

  return(
  <>
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className="page-item">
          <a
            className={`page-link ${pagination.has_pre ? "" : "disabled"}`}
            href="#"
            aria-label="Previous"
            onClick={(e)=>handlePageClick(e,pagination.current_page-1)}>
            <span>&laquo;</span>
          </a>
        </li>
        {
          [...new Array(pagination.total_pages)].map((_,index)=>(
            <li className="page-item" key={index}>
              <a
                className={`page-link ${pagination.current_page === index+1 ? "active" : ""}`}
                href="#" onClick={(e)=>handlePageClick(e,index+1)} >
                {index+1}
              </a>
            </li>
          ))
        }
        <li className="page-item">
          <a 
            className={`page-link ${pagination.has_next ? "" : "disabled"}`}
            href="#"
            aria-label="Next"
            onClick={(e)=>handlePageClick(e,pagination.current_page+1)}>
            <span>&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </>
)}

export default Pagination