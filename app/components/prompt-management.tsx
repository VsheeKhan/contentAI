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
import { Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { Textarea } from "@/components/ui/textarea";

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
  };

  const handleSave = async (id: string) => {
    setError(null);
    setEditingId(null);
    const prompt = prompts.find((p) => p._id === id);
    try {
      const response = await authFetch(`/api/prompt/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: prompt?.name,
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
    setNewPrompt({ name: "", type: "", prompt: "" });
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

  const renderRow = (prompt: Prompt, isEditing: boolean) => (
    <>
      <TableRow key={prompt._id}>
        <TableCell>
          {isEditing ? (
            <Input
              value={prompt.name}
              onChange={(e) =>
                setPrompts(
                  prompts.map((p) =>
                    p._id === prompt._id ? { ...p, name: e.target.value } : p
                  )
                )
              }
            />
          ) : (
            prompt.name
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <Input
              value={prompt.type}
              onChange={(e) =>
                setPrompts(
                  prompts.map((p) =>
                    p._id === prompt._id ? { ...p, type: e.target.value } : p
                  )
                )
              }
            />
          ) : (
            prompt.type
          )}
        </TableCell>
        <TableCell>
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
            <div className="flex">
              <Button onClick={() => handleSave(prompt._id)} className="mr-2">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => handleEdit(prompt._id)}>Edit</Button>
          )}
        </TableCell>
      </TableRow>
      {isEditing && (
        <TableRow>
          <TableCell colSpan={4}>
            <Alert>
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
              <TableHead className="w-[60%]">Prompt</TableHead>
              <TableHead className="w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newPrompt && (
              <TableRow>
                <TableCell>
                  <Input
                    value={newPrompt.name}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, name: e.target.value })
                    }
                    placeholder="Enter name"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newPrompt.type}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, type: e.target.value })
                    }
                    placeholder="Enter type"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newPrompt.prompt}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, prompt: e.target.value })
                    }
                    placeholder="Enter prompt"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveNew}
                      disabled={
                        !newPrompt.name || !newPrompt.type || !newPrompt.prompt
                      }
                      className="mr-2"
                    >
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {prompts.map((prompt) =>
              renderRow(prompt, editingId === prompt._id)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
