import { createContext, useContext, useState } from "react";

const NavigationContext = createContext({
  currentPage: "home",
  navigate: () => {},
  pageData: {},
});

export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState("home");
  const [pageData, setPageData] = useState({});

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, pageData }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
