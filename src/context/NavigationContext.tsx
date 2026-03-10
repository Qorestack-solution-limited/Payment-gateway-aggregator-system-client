import React, { useState, createContext, useContext } from "react";
import { ReactNode } from "react";
type Page =
  | "home"
  | "/login"
  | "/signup"
  | "contact"
  | "docs"
  | "blog"
  | "blog-post"
  | "privacy"
  | "terms"
  | "compliance";
type NavigationContextType = {
  currentPage: Page;
  navigate: (page: Page, data?: Record<string, unknown>) => void;
  pageData: Record<string, unknown>;
};
const NavigationContext = createContext<NavigationContextType>({
  currentPage: "home",
  navigate: () => {},
  pageData: {},
});
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [pageData, setPageData] = useState<Record<string, unknown>>({});
  const navigate = (page: Page, data: Record<string, unknown> = {}) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigate,
        pageData,
      }}>
      {children}
    </NavigationContext.Provider>
  );
}
export function useNavigation() {
  return useContext(NavigationContext);
}
