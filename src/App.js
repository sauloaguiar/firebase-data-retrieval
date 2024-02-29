import React, { useEffect, useReducer } from "react";
import "./App.css";
import { db } from "./db"; // Import this line to use the Firestore database connection
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  endAt,
} from "firebase/firestore";
import { useDebounce } from "use-debounce";
import { ErrorBoundary } from "react-error-boundary";

const noticesCollection = collection(db, "notices");

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function SearchBar({ filterText, onChange }) {
  return (
    <form>
      <input
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

function NoticeTable({ notices, status }) {
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

function PublishedNotices({ state, onSearchChange }) {
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

const noticeReducer = (state, action) => {
  switch (action.type) {
    case "loading": {
      return { ...state, status: action.type, error: "" };
    }
    case "success": {
      return {
        ...state,
        status: action.type,
        notices: action.payload,
        lastVisible: action.payload[action.payload.length - 1]
          ? action.payload[action.payload.length - 1]
          : null,
        firstVisible: action.payload[0] ? action.payload[0] : null,
      };
    }
    case "error": {
      return { ...state, status: action.type, error: action.error.message };
    }
    case "input": {
      return { ...state, input: action.payload };
    }
    case "updateCount": {
      return { ...state, count: action.payload };
    }
    default: {
      return state;
    }
  }
};

const initialNoticeScreenState = {
  status: "idle", // idle, loading, success, error
  notices: [],
  input: "",
  error: "",
  pageSize: 10,
  lastVisible: null,
  firstVisible: null,
};

function App() {
  const [state, dispatch] = useReducer(noticeReducer, initialNoticeScreenState);
  const { input, pageSize, lastVisible, firstVisible, error } = state;
  const [debouncedInput] = useDebounce(input, 500);
  const filters = [
    where("title", ">=", debouncedInput),
    where("title", "<=", debouncedInput + "\uf8ff"),
    orderBy("publicationDate", "desc"),
  ];

  const filterLoad = async () => {
    const noticesQuery = query(noticesCollection, ...filters, limit(pageSize));
    try {
      const documents = await getDocs(noticesQuery);
      dispatch({ type: "success", payload: documents.docs });
    } catch (error) {
      dispatch({ type: "error", error });
    }
  };

  const nextPage = async () => {
    const q = query(
      noticesCollection,
      ...filters,
      startAfter(lastVisible),
      limit(pageSize)
    );
    const documents = await getDocs(q);
    dispatch({ type: "success", payload: documents.docs });
  };

  const previousPage = async () => {
    const q = query(
      noticesCollection,
      ...filters,
      endAt(firstVisible),
      limit(pageSize)
    );
    const documents = await getDocs(q);
    dispatch({ type: "success", payload: documents.docs });
  };

  useEffect(() => {
    filterLoad();
  }, [debouncedInput]);

  // add test to UI components - test if callbacks are correctly called
  // check that props were correctly used
  if (error) {
    return (
      <div>
        <p>Oops, something went wrong.</p>
        <p>{error}</p>
      </div>
    );
  }

  // use material UI to have something more beautiful
  return (
    <div>
      <PublishedNotices
        state={state}
        onSearchChange={(value) => dispatch({ type: "input", payload: value })}
      />

      <div onClick={() => previousPage()}>Less...</div>
      <div onClick={() => nextPage()}>More...</div>
    </div>
  );
}

export default App;
