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
import { PublishedNotices } from "./Components";
import Container from "@mui/material/Container";

const noticesCollection = collection(db, "notices");

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
    const noticesQuery = query(noticesCollection, ...filters);
    try {
      const documents = await getDocs(noticesQuery);
      dispatch({ type: "success", payload: documents.docs });
    } catch (error) {
      dispatch({ type: "error", error });
    }
  };

  const nextPage = async () => {
    const q = query(noticesCollection, ...filters, startAfter(lastVisible));
    const documents = await getDocs(q);
    dispatch({ type: "success", payload: documents.docs });
  };

  const previousPage = async () => {
    const q = query(noticesCollection, ...filters, endAt(firstVisible));
    const documents = await getDocs(q);
    dispatch({ type: "success", payload: documents.docs });
  };

  useEffect(() => {
    filterLoad();
  }, [debouncedInput]);

  if (error) {
    return (
      <div>
        <p>Oops, something went wrong.</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Container maxWidth="xl">
      <PublishedNotices
        state={state}
        onSearchChange={(value) => dispatch({ type: "input", payload: value })}
      />
    </Container>
  );
}

export default App;
