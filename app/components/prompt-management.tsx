"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Prompt = {
  _id: string;
  name: string;
  type: string;
  prompt: string;
};

export default function PromptManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt> | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/prompt/prompts");
      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      setError(
        "An error occurred while fetching prompts. Please try again later."
      );
      console.error("Error fetching prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setError(null);
    setEditingId(id);
    if (!expandedRows.includes(id)) {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const handleSave = async (id: string) => {
    setError(null);
    setEditingId(null);
    const prompt = prompts.find((p) => p._id === id);
    try {
      const response = await authFetch(`/api/prompt/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          prompt: prompt?.prompt,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save prompt");
      }
    } catch (error) {
      setError(
        "An error occurred while saving prompt. Please try again later."
      );
      console.error("Error saving prompt:", error);
    }
  };

  const handleCancel = () => {
    setError(null);
    setEditingId(null);
    setNewPrompt(null);
  };

  const handleCreate = () => {
    setError(null);
    setNewPrompt({ name: "", type: "user", prompt: "" });
  };

  const handleSaveNew = async () => {
    setError(null);
    if (newPrompt && newPrompt.name && newPrompt.type && newPrompt.prompt) {
      setNewPrompt(null);
      try {
        const response = await authFetch("/api/prompt/create", {
          method: "POST",
          body: JSON.stringify(newPrompt),
        });
        if (!response.ok) {
          throw new Error("Failed to save prompt");
        }
        const data = await response.json();
        setPrompts([...prompts, data]);
      } catch (error) {
        setError(
          "An error occurred while saving prompt. Please try again later."
        );
        console.error("Error saving prompt:", error);
      }
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(
      expandedRows.includes(id)
        ? expandedRows.filter((rowId) => rowId !== id)
        : [...expandedRows, id]
    );
  };

  const renderRow = (prompt: Prompt, isEditing: boolean) => (
    <>
      <TableRow key={prompt._id}>
        <TableCell className="font-medium">
          <div className="flex items-center">
            <span className="mr-2">{prompt.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 rounded-full lg:hidden"
              onClick={() => toggleRowExpansion(prompt._id)}
            >
              {expandedRows.includes(prompt._id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell">{prompt.type}</TableCell>
        <TableCell className="hidden lg:table-cell">
          {isEditing ? (
            <Textarea
              value={prompt.prompt}
              onChange={(e) =>
                setPrompts(
                  prompts.map((p) =>
                    p._id === prompt._id ? { ...p, prompt: e.target.value } : p
                  )
                )
              }
            />
          ) : (
            prompt.prompt
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
              <Button onClick={() => handleSave(prompt._id)}>Save</Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => handleEdit(prompt._id)}>Edit</Button>
          )}
        </TableCell>
      </TableRow>
      {(expandedRows.includes(prompt._id) || isEditing) && (
        <TableRow className="lg:hidden">
          <TableCell colSpan={4}>
            <div className="space-y-2">
              <div>
                <label className="font-medium">Name:</label>
                <p>{prompt.name}</p>
              </div>
              <div>
                <label className="font-medium">Type:</label>
                <p>{prompt.type}</p>
              </div>
              <div>
                <label className="font-medium">Prompt:</label>
                {isEditing ? (
                  <Textarea
                    value={prompt.prompt}
                    onChange={(e) =>
                      setPrompts(
                        prompts.map((p) =>
                          p._id === prompt._id
                            ? { ...p, prompt: e.target.value }
                            : p
                        )
                      )
                    }
                    className="mt-1"
                  />
                ) : (
                  <p>{prompt.prompt}</p>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
      {isEditing && (
        <TableRow>
          <TableCell colSpan={4}>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please be mindful of the name and order of the tags while
                editing. Avoid frequent updates to the prompt.
              </AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>Create New Prompt</Button>
      </div>
      {newPrompt && (
        <div className="flex flex-col space-y-4">
          <div className="flex w-full space-x-2">
            <Input
              value={newPrompt.name}
              onChange={(e) =>
                setNewPrompt({ ...newPrompt, name: e.target.value })
              }
              placeholder="Enter name"
            />

            <Select
              value={newPrompt.type}
              onValueChange={(value) =>
                setNewPrompt({ ...newPrompt, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="prompt">Prompt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full space-x-2">
            <Textarea
              value={newPrompt.prompt}
              onChange={(e) =>
                setNewPrompt({ ...newPrompt, prompt: e.target.value })
              }
              placeholder="Enter prompt"
            />
          </div>
          <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
            <Button
              onClick={handleSaveNew}
              disabled={!newPrompt.name || !newPrompt.type || !newPrompt.prompt}
            >
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[10%] hidden lg:table-cell">
                Type
              </TableHead>
              <TableHead className="w-[50%] hidden lg:table-cell">
                Prompt
              </TableHead>
              <TableHead className="w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) =>
              renderRow(prompt, editingId === prompt._id)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
