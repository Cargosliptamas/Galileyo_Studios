"use client";

import { createContext, useContext, useState } from "react";

export const AlertMapContext = createContext<{
  showList: boolean;
  toggleList: () => void;
}>({
  showList: false,
  toggleList: () => {
    // noop
  },
});

export function useAlertMapContext() {
  const context = useContext(AlertMapContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useAlertMapContext must be used within a AlertMapContextProvider",
    );
  }

  return context;
}

export function AlertMapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showList, setShowList] = useState(true);

  const toggleList = () => {
    setShowList(!showList);
  };

  return (
    <AlertMapContext.Provider value={{ showList, toggleList }}>
      {children}
    </AlertMapContext.Provider>
  );
}
