import React from "react";
import { ErrorBoundary } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre aria-label="error-message" style={{ color: "red" }}>
        {error.message}
      </pre>
      <button aria-label="error-button-retry" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

export function SearchBar({ filterText, onChange }) {
  return (
    <form>
      <input
        aria-label="search"
        type="text"
        placeholder="Search..."
        value={filterText}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  );
}

function NoticeRow({ notice }) {
  return (
    <tr>
      <td>{notice.title}</td>
      <td>{notice.publicationDate.toDate().toDateString()}</td>
    </tr>
  );
}

export function NoticeTable({ notices, status }) {
  if (status === "loading") {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const entries = notices
    .map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))
    .map((notice) => <NoticeRow notice={notice} key={notice.id} />);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Published Date</th>
        </tr>
      </thead>
      <tbody>{entries}</tbody>
    </table>
  );
}

export function PublishedNotices({ state, onSearchChange }) {
  const { status } = state;
  return (
    <main>
      <SearchBar filterText={state.searchText} onChange={onSearchChange} />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => onSearchChange("")}
      >
        <NoticeTable notices={state.notices} status={status} />
      </ErrorBoundary>
    </main>
  );
}
