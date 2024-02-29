import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar, ErrorFallback } from "./Components";

describe("SearchBar", () => {
  const setup = ({ initialValue = "", callback = () => {} }) => {
    const utils = render(
      <SearchBar filterText={initialValue} onChange={callback} />
    );
    const input = screen.getByLabelText("search");
    return {
      input,
      ...utils,
    };
  };

  test("It should update input when value is provided", () => {
    const { input } = setup({ initialValue: "Notice" });
    expect(input.value).toBe("Notice");
  });

  test("It should call onChange callback when theres input", () => {
    const mockCallback = jest.fn();
    const { input } = setup({ callback: mockCallback });
    fireEvent.change(input, { target: { value: "Notice" } });
    expect(mockCallback).toHaveBeenCalledWith("Notice");
  });
});

describe("ErrorFallback", () => {
  const setup = ({ error = { message: "" }, callback = () => {} }) => {
    const utils = render(
      <ErrorFallback error={error} resetErrorBoundary={callback} />
    );

    return {
      ...utils,
    };
  };
  test("It should render error message", () => {
    const error = { message: "Something went wrong" };
    const { getByText } = setup({ error });
    expect(getByText("Something went wrong")).toBeInTheDocument();
  });

  test("Retry button should be enabled and fire onClick", () => {
    const error = { message: "Something went wrong" };
    const mockCallback = jest.fn();
    const { getByLabelText } = setup({ error, callback: mockCallback });
    const button = getByLabelText("error-button-retry");
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(mockCallback).toHaveBeenCalled();
  });
});
