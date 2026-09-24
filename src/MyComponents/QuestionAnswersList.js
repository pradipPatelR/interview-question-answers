import { QuestionAnswerItem } from "./QuestionAnswerItem";

export const QuestionAnswersList = (props) => {
  const {
    questionAnswers,
    totalCount,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    searchQuery
  } = props;

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // For display purposes at the bottom
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + questionAnswers.length;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 on limit change
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container mb-5 pb-5">
      {questionAnswers.length === 0 ? (
        <div className="container text-center mt-4">
          <img
            src={process.env.PUBLIC_URL + (searchQuery?.trim() === "" ? '/ic_questionAnswer_list_empty.png' : '/ic_questionAnswer_searchList_empty.png')}
            alt="No Questions"
            style={{ width: "45%", height: "45%" }}
          />
        </div>
      ) : (
        <>
          {questionAnswers.map((questionAnswer, index) => (
            <QuestionAnswerItem 
              questionAnswer={questionAnswer} 
              key={questionAnswer.id} 
              questionNumber={indexOfFirstItem + index + 1}
              onDelete={props.onDelete} 
              onUpdate={props.onUpdate} 
              onForceDelete={props.onForceDelete}
              onToggleDelete={props.onToggleDelete}
              session={props.session}
              topicName={props.topicName}
              categoryName={props.categoryName}
            />
          ))}

          {totalCount > 10 ? (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-4 gap-3">
            <div className="d-flex align-items-center">
              <label htmlFor="itemsPerPage" className="me-2 fw-semibold text-nowrap mb-0">
                Show questions:
              </label>
              <select
                id="itemsPerPage"
                className="form-select form-select-sm w-auto"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="text-muted small">
              Showing {totalCount > 0 ? indexOfFirstItem + 1 : 0} - {indexOfLastItem} of {totalCount}
            </div>

            <nav aria-label="Question Answers pagination">
              <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(1)}>
                    First
                  </button>
                </li>

                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    &laquo; Prev
                  </button>
                </li>

                {getPageNumbers().map((number) => (
                  <li
                    key={number}
                    className={`page-item ${currentPage === number ? 'active' : ''}`}
                  >
                    <button className="page-link" onClick={() => handlePageChange(number)}>
                      {number}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    Next &raquo;
                  </button>
                </li>

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                    Last
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          ) : null}
        </>
      )}
    </div>
  );
};