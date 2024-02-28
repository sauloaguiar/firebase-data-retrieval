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
} from "firebase/firestore";
import { useDebounce } from "use-debounce";

const noticesCollection = collection(db, "notices");

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
  if (status === "error") {
    return (
      <div>
        <p>Oops, something went wrong.</p>
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const entries = [];
  notices.forEach((notice) => {
    entries.push(<NoticeRow notice={notice} key={notice.id} />);
  });
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
      <NoticeTable notices={state.notices} status={status} />
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
        lastVisible: action.payload.length - 1,
      };
    }
    case "error": {
      return { ...state, status: action.type, error: action.error.message };
    }
    case "input": {
      return { ...state, input: action.payload };
    }
    case "updateLastVisible": {
      return { ...state, lastVisible: action.payload };
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
  lastVisible: 0,
  pageSize: 5,
};

function App() {
  const [state, dispatch] = useReducer(noticeReducer, initialNoticeScreenState);
  const { input, lastVisible, pageSize } = state;
  const [debouncedInput] = useDebounce(input, 500);

  useEffect(() => {
    const fetchNotices = async () => {
      dispatch({ type: "loading" });
      console.log("input", debouncedInput);
      const q = query(
        noticesCollection,
        where("title", ">=", debouncedInput),
        where("title", "<", `${debouncedInput}z`),
        orderBy("publicationDate", "asc"),
        limit(pageSize)
        // startAfter(lastVisible),
      );
      try {
        const results = await getDocs(q);
        const notices = results.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        dispatch({ type: "success", payload: notices });
      } catch (error) {
        dispatch({ type: "error", error });
      }
    };
    fetchNotices();
  }, [debouncedInput]);

  // define a query and see how results get filtered
  // add search field to filter results
  // add debounce to input field
  // add sorting to the query
  // add pagination to the query
  console.log("lastVisible", lastVisible);
  return (
    <PublishedNotices
      state={state}
      onSearchChange={(value) => dispatch({ type: "input", payload: value })}
    />
  );
}

export default App;
