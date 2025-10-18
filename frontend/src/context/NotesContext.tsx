"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesContextType {
  notes: Note[];
  createNote: (title: string, content: string) => Promise<boolean>;
  getNoteById: (id: string) => Note | undefined;
  updateNote: (
    id: string,
    title: string,
    content: string,
  ) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  const getNotesFromStorage = useCallback(() => {
    if (!user) return [];
    const storedNotes = localStorage.getItem(`notes_${user.id}`);
    return storedNotes ? JSON.parse(storedNotes) : [];
  }, [user]);

  const saveNotesToStorage = useCallback(
    (notesToSave: Note[]) => {
      if (!user) return;
      localStorage.setItem(`notes_${user.id}`, JSON.stringify(notesToSave));
    },
    [user],
  );

  useEffect(() => {
    setNotes(getNotesFromStorage());
  }, [user, getNotesFromStorage]);

  const createNote = useCallback(
    async (title: string, content: string): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to create a note.");
        return false;
      }

      const newNote: Note = {
        id: new Date().toISOString(),
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      toast.success("Note created successfully!");
      return true;
    },
    [user, notes, saveNotesToStorage],
  );

  const getNoteById = useCallback(
    (id: string): Note | undefined => {
      return notes.find((note) => note.id === id);
    },
    [notes],
  );

  const updateNote = useCallback(
    async (id: string, title: string, content: string): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to update a note.");
        return false;
      }

      const updatedNotes = notes.map((note) =>
        note.id === id
          ? { ...note, title, content, updated_at: new Date().toISOString() }
          : note,
      );

      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      toast.success("Note updated successfully!");
      return true;
    },
    [user, notes, saveNotesToStorage],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to delete a note.");
        return false;
      }

      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      toast.success("Note deleted successfully!");
      return true;
    },
    [user, notes, saveNotesToStorage],
  );

  return (
    <NotesContext.Provider
      value={{ notes, createNote, getNoteById, updateNote, deleteNote }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};