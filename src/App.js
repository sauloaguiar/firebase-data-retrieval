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
  getCountFromServer,
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
  lastVisible: 0,
  pageSize: 10,
  count: 0,
};

function App() {
  const [state, dispatch] = useReducer(noticeReducer, initialNoticeScreenState);
  const { notices, input, lastVisible, pageSize, count } = state;
  const [debouncedInput] = useDebounce(input, 500);

  const fetchNotices = async (loadMore = false) => {
    dispatch({ type: "loading" });
    console.log("input", debouncedInput);

    const pagination = loadMore
      ? [startAfter(notices[notices.length - 1])]
      : [];

    const filters = [
      where("title", ">=", debouncedInput),
      where("title", "<=", debouncedInput + "\uf8ff"),
      orderBy("publicationDate", "desc"),
      ...pagination,
    ];
    console.log("filters", filters);
    const noticesQuery = query(noticesCollection, ...filters, limit(pageSize));
    // const noticesCount = query(noticesCollection, ...filters);
    // const totalCount = await getCountFromServer(noticesCount);
    try {
      const results = await getDocs(noticesQuery);
      const notices = results.docs;
      console.log("notices", notices);

      dispatch({ type: "success", payload: notices });
      // dispatch({ type: "updateCount", payload: totalCount });
    } catch (error) {
      dispatch({ type: "error", error });
      throw new Error(error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [debouncedInput]);

  // define a query and see how results get filtered
  // add search field to filter results
  // add debounce to input field
  // add sorting to the query
  // add pagination to the query
  return (
    <div>
      <PublishedNotices
        state={state}
        onSearchChange={(value) => dispatch({ type: "input", payload: value })}
      />
      <div onClick={() => fetchNotices(true)}>Load More...</div>
    </div>
  );
}

export default App;
