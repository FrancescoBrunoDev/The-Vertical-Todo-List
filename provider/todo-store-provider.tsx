"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type ToDoStore,
  createToDoStore,
  initToDoStore,
} from "@/stores/todo-store";

export type ToDoStoreApi = ReturnType<typeof createToDoStore>;

export const ToDoStoreContext = createContext<ToDoStoreApi | undefined>(
  undefined,
);

export interface ToDoStoreProviderProps {
  children: ReactNode;
}

export const ToDoStoreProvider = ({ children }: ToDoStoreProviderProps) => {
  const storeRef = useRef<ToDoStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createToDoStore(initToDoStore());
  }

  return (
    <ToDoStoreContext.Provider value={storeRef.current}>
      {children}
    </ToDoStoreContext.Provider>
  );
};

export const useToDoStore = <T,>(selector: (store: ToDoStore) => T): T => {
  const toDoStoreContext = useContext(ToDoStoreContext);

  if (!toDoStoreContext) {
    throw new Error("useToDoStore must be used within a ToDoStoreProvider");
  }

  return useStore(toDoStoreContext, selector);
};
