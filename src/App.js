import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { db } from "./db"; // Import this line to use the Firestore database connection
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useDebounce } from "use-debounce";

const noticesCollection = collection(db, "notices");

function App() {
  const [notices, setNotices] = useState([]);
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 500);

  useEffect(() => {
    const fetchNotices = async () => {
      console.log("intput", debouncedInput);
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
    <div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </div>
      <ul>
        {notices.map((notice) => (
          <li key={notice.id}>
            {notice.title} - {notice.publicationDate.toDate().toDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
