import React, { useEffect, useState } from "react";
import "./App.css";
import { db } from "./db"; // Import this line to use the Firestore database connection
import { onSnapshot, collection } from "firebase/firestore";

// firebase has two ways of getting data
// getData

// onSnapshot - will listen for realtime updates
// onSnapshot returns a function to unsubscribe from updates
function App() {
  const [notices, setNotices] = useState([]);
  useEffect(
    () =>
      onSnapshot(collection(db, "notices"), (snapshot) =>
        setNotices(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      ),
    []
  );

  // define a query and see how results get filtered
  // add search field to filter results
  // add debounce to input field
  // add sorting to the query
  // add pagination to the query

  console.log("notices", notices);
  return (
    <div>
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
