"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { authFetch } from "../utils/authFetch";

type QuestionType =
  | "Input text"
  | "Single Choice"
  | "Multiple Choices"
  | "Yes/No";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
}

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] =
    useState<QuestionType>("Input text");
  const [newOptions, setNewOptions] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      const questionsToAdd = data.map((question) => {
        const questionToAdd: Question = {
          id: question._id,
          text: question.question,
          type:
            question.questionType === "single_choice"
              ? "Single Choice"
              : question.questionType === "radio"
              ? "Yes/No"
              : question.questionType === "mcq"
              ? "Multiple Choices"
              : "Input text",
        };
        if (question.options) {
          questionToAdd.options = Object.values(question.options);
        }
        return questionToAdd;
      });
      setQuestions([...questions, ...questionsToAdd]);
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const mapQuestionType = (type: string): string => {
    switch (type) {
      case "Input text":
        return "text";
      case "Single Choice":
        return "single_choice";
      case "Yes/No":
        return "radio";
      case "Multiple Choices":
        return "mcq";
      default:
        return "text";
    }
  };

  const addQuestion = async () => {
    setError(null);
    if (newQuestion) {
      const questionToAdd: any = {
        question: newQuestion,
        questionType: mapQuestionType(newQuestionType),
        status: 1,
        options: null,
      };
      if (
        (newQuestionType === "Single Choice" ||
          newQuestionType === "Multiple Choices") &&
        newOptions
      ) {
        const optionsArray = newOptions
          .split(",")
          .map((option) => option.trim());
        questionToAdd.options = optionsArray.reduce((acc, option, index) => {
          acc[`option${index + 1}`] = option;
          return acc;
        }, {} as Record<string, any>);
      }
      if (newQuestionType === "Yes/No") {
        questionToAdd.options = {
          option1: "Yes",
          option2: "No",
        };
      }
      try {
        const response = await authFetch("/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionToAdd),
        });
        if (!response.ok) {
          throw new Error("Failed to add question");
        }

        const addedQuestion = await response.json();
        const questionToAddToState: Question = {
          id: addedQuestion._id,
          text: addedQuestion.question,
          type:
            addedQuestion.questionType === "single_choice"
              ? "Single Choice"
              : addedQuestion.questionType === "mcq"
              ? "Multiple Choices"
              : addedQuestion.questionType === "radio"
              ? "Yes/No"
              : "Input text",
        };
        if (addedQuestion.options) {
          questionToAddToState.options = Object.values(addedQuestion.options);
        }
        setQuestions([...questions, questionToAddToState]);
        setNewQuestion("");
        setNewOptions("");
      } catch (error) {
        console.error("Error adding question:", error);
        setError(
          "An error occurred while adding the question. Please try again."
        );
      }
    } else {
      setError("Please enter the question to be added.");
    }
  };

  const removeQuestion = async (id: number) => {
    setError(null);
    try {
      const response = await authFetch(`/api/questions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete question");
      }
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error removing question:", error);
      setError(
        "An error occurred while removing the question. Please try again."
      );
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestion({ ...question });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;

    setError(null);
    try {
      const questionToUpdate: any = {
        question: editingQuestion.text,
        questionType: mapQuestionType(editingQuestion.type),
        status: 1,
        options: null,
      };

      if (
        (editingQuestion.type === "Single Choice" ||
          editingQuestion.type === "Multiple Choices") &&
        editingQuestion.options
      ) {
        questionToUpdate.options = editingQuestion.options.reduce(
          (acc, option, index) => {
            acc[`option${index + 1}`] = option;
            return acc;
          },
          {} as Record<string, any>
        );
      }

      if (editingQuestion.type === "Yes/No") {
        questionToUpdate.options = {
          option1: "Yes",
          option2: "No",
        };
      }

      const response = await authFetch(`/api/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionToUpdate),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const updatedQuestion = await response.json();
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                text: updatedQuestion.question,
                type:
                  updatedQuestion.questionType === "single_choice"
                    ? "Single Choice"
                    : updatedQuestion.questionType === "mcq"
                    ? "Multiple Choices"
                    : updatedQuestion.questionType === "radio"
                    ? "Yes/No"
                    : "Input text",
                options: updatedQuestion.options
                  ? Object.values(updatedQuestion.options)
                  : undefined,
              }
            : q
        )
      );
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      setError(
        "An error occurred while updating the question. Please try again."
      );
    }
  };

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="new-question">New Question</Label>
          <Input
            id="new-question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter new question"
          />
        </div>
        <div>
          <Label htmlFor="question-type">Question Type</Label>
          <Select
            value={newQuestionType}
            onValueChange={(value: QuestionType) => setNewQuestionType(value)}
          >
            <SelectTrigger id="question-type">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Input text">Input text</SelectItem>
              <SelectItem value="Single Choice">Single Choice</SelectItem>
              <SelectItem value="Yes/No">Yes/No</SelectItem>
              <SelectItem value="Multiple Choices">Multiple Choices</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {(newQuestionType === "Single Choice" ||
        newQuestionType === "Multiple Choices") && (
        <div>
          <Label htmlFor="options">Options (comma-separated)</Label>
          <Input
            id="options"
            value={newOptions}
            onChange={(e) => setNewOptions(e.target.value)}
            placeholder="Enter options, separated by commas"
          />
        </div>
      )}
      <Button onClick={addQuestion}>Add Question</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44%]">Question</TableHead>
            <TableHead className="w-[15%]">Type</TableHead>
            <TableHead className="w-[40%]">Options</TableHead>
            <TableHead className="w-[1%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                {editingQuestion?.id === question.id ? (
                  <Input
                    value={editingQuestion.text}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        text: e.target.value,
                      })
                    }
                  />
                ) : (
                  question.text
                )}
              </TableCell>
              <TableCell>
                {editingQuestion?.id === question.id ? (
                  <Select
                    value={editingQuestion.type}
                    onValueChange={(value: QuestionType) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        type: value,
                        options:
                          value === "Yes/No"
                            ? ["Yes", "No"]
                            : editingQuestion.options,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Input text">Input text</SelectItem>
                      <SelectItem value="Single Choice">
                        Single Choice
                      </SelectItem>
                      <SelectItem value="Yes/No">Yes/No</SelectItem>
                      <SelectItem value="Multiple Choices">
                        Multiple Choices
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  question.type
                )}
              </TableCell>
              <TableCell>
                {editingQuestion?.id === question.id &&
                (editingQuestion.type === "Single Choice" ||
                  editingQuestion.type === "Multiple Choices") ? (
                  <Input
                    value={editingQuestion.options?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        options: e.target.value.split(",").map((o) => o.trim()),
                      })
                    }
                    placeholder="Enter options, separated by commas"
                  />
                ) : editingQuestion?.id === question.id &&
                  editingQuestion.type === "Input text" ? (
                  "-"
                ) : question.options ? (
                  question.options.join(", ")
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end space-x-2">
                  {editingQuestion?.id === question.id ? (
                    <>
                      <Button
                        onClick={updateQuestion}
                        size="icon"
                        variant="ghost"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => startEditing(question)}
                        size="icon"
                        variant="ghost"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
