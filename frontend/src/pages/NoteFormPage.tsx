"use client";

import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNotes } from "@/context/NotesContext";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  title: z.string().max(255, { message: "Title cannot exceed 255 characters." }).optional(),
  content: z.string().min(1, { message: "Content cannot be empty." }).max(10000, { message: "Content cannot exceed 10,000 characters." }),
});

const NoteFormPage = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const navigate = useNavigate();
  const { createNote, getNoteById, updateNote } = useNotes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        form.reset({
          title: note.title || "",
          content: note.content,
        });
      } else {
        // If noteId is provided but note not found, redirect to notes list
        navigate("/notes");
      }
    }
  }, [noteId, getNoteById, form, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let success = false;
    if (noteId) {
      success = await updateNote(noteId, values.title || "", values.content);
    } else {
      success = await createNote(values.title || "", values.content);
    }

    if (success) {
      navigate("/notes");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/notes")} className="p-0 h-auto">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Notes
            </Button>
            <CardTitle className="text-2xl">
              {noteId ? "Edit Note" : "Create New Note"}
            </CardTitle>
            <div></div> {/* Spacer for alignment */}
          </div>
          <CardDescription>
            {noteId
              ? "Modify your note's title and content."
              : "Enter a title and content for your new note."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="My awesome note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Start typing your note here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {noteId ? "Save Changes" : "Create Note"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteFormPage;