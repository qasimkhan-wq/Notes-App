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
  fetchNotes: () => Promise<void>;
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

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        toast.error("Failed to fetch notes.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching notes.");
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [user, fetchNotes]);

  const createNote = useCallback(
    async (title: string, content: string): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to create a note.");
        return false;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found.");
        return false;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/notes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
          },
        );

        if (response.ok) {
          await fetchNotes();
          toast.success("Note created successfully!");
          return true;
        } else {
          toast.error("Failed to create note.");
          return false;
        }
      } catch (error) {
        toast.error("An error occurred while creating the note.");
        return false;
      }
    },
    [user, fetchNotes],
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

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found.");
        return false;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/notes/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
          },
        );

        if (response.ok) {
          await fetchNotes();
          toast.success("Note updated successfully!");
          return true;
        } else {
          toast.error("Failed to update note.");
          return false;
        }
      } catch (error) {
        toast.error("An error occurred while updating the note.");
        return false;
      }
    },
    [user, fetchNotes],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to delete a note.");
        return false;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found.");
        return false;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/notes/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          await fetchNotes();
          toast.success("Note deleted successfully!");
          return true;
        } else {
          toast.error("Failed to delete note.");
          return false;
        }
      } catch (error) {
        toast.error("An error occurred while deleting the note.");
        return false;
      }
    },
    [user, fetchNotes],
  );

  return (
    <NotesContext.Provider
      value={{ notes, fetchNotes, createNote, getNoteById, updateNote, deleteNote }}
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