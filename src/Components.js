import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, TextField, Stack, Box } from "@mui/material";

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
    <Stack
      spacing={2}
      sx={{
        display: "flex",
        flexDirection: { md: "row", xs: "column" },
        justifyContent: "space-between",
        alignItems: "center",
        height: "20vh",
      }}
    >
      <Typography variant="h2">Notices</Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Search by</Typography>
        <form onSubmit={(event) => event.preventDefault()}>
          <TextField
            id="outlined-basic"
            label="Notice title"
            variant="outlined"
            aria-label="search"
            type="text"
            placeholder="Search..."
            value={filterText}
            onChange={(event) => onChange(event.target.value)}
          />
        </form>
      </Stack>
    </Stack>
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
  const columns = [
    { field: "publicationDate", headerName: "Published at", flex: 1 },
    { field: "title", headerName: "Title", flex: 2 },
    { field: "content", headerName: "Content", flex: 3 },
  ];
  const entries = notices.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    publicationDate: doc.data().publicationDate.toDate().toDateString(),
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={entries}
        columns={columns}
        loading={status === "loading"}
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
      />
    </Box>
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
