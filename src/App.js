import React, { useEffect, useState } from "react";
import "./App.css";
import { db } from "./db"; // Import this line to use the Firestore database connection
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
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

function NoticeTable({ notices }) {
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

function PublishedNotices({ notices, searchText, onSearchChange }) {
  return (
    <main>
      <SearchBar filterText={searchText} onChange={onSearchChange} />
      <NoticeTable notices={notices} />
    </main>
  );
}

function App() {
  const [notices, setNotices] = useState([]);
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 500);

  useEffect(() => {
    const fetchNotices = async () => {
      console.log("input", debouncedInput);
      const q = query(
        noticesCollection,
        where("title", ">=", debouncedInput),
        where("title", "<", `${debouncedInput}z`),
        orderBy("publicationDate", "asc")
        // startAfter(lastVisible),
        // limit(pageSize)
      );
      const results = await getDocs(q);
      setNotices(results.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchNotices();
  }, [debouncedInput]);

  // define a query and see how results get filtered
  // add search field to filter results
  // add debounce to input field
  // add sorting to the query
  // add pagination to the query

  return (
    <PublishedNotices
      notices={notices}
      searchText={input}
      onSearchChange={(value) => setInput(value)}
    />
  );
}

export default App;
