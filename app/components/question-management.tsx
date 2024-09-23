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
import { Loader2 } from "lucide-react";
import { authFetch } from "../utils/authFetch";

type QuestionType = "Input text" | "Single Choice" | "Yes/No";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
}

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([
    // {
    //   id: 1,
    //   text: "What's your favorite feature of our product?",
    //   type: "Input text",
    // },
    // {
    //   id: 2,
    //   text: "How has our service improved your workflow?",
    //   type: "Input text",
    // },
    // {
    //   id: 3,
    //   text: "Would you recommend our product to a friend?",
    //   type: "Yes/No",
    // },
    // {
    //   id: 4,
    //   text: "Which of the following best describes your role?",
    //   type: "Single Choice",
    //   options: ["Developer", "Designer", "Manager", "Other"],
    // },
    // { id: 5, text: "What's one feature you wish we had?", type: "Input text" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] =
    useState<QuestionType>("Input text");
  const [newOptions, setNewOptions] = useState("");

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
      console.log("Fetched questions: ", data);
      const questionsToAdd = data.map((question) => {
        const questionToAdd: Question = {
          id: question._id,
          text: question.question,
          type:
            question.questionType === "single_choice"
              ? "Single Choice"
              : question.questionType === "radio"
              ? "Yes/No"
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
      // Add other mappings
      default:
        return "text";
    }
  };

  const addQuestion = async () => {
    if (newQuestion) {
      const questionToAdd: any = {
        question: newQuestion,
        questionType: mapQuestionType(newQuestionType),
        status: 1,
        options: null,
      };
      if (newQuestionType === "Single Choice" && newOptions) {
        const optionsArray = newOptions
          .split(",")
          .map((option) => option.trim());
        questionToAdd.options = optionsArray.reduce((acc, option, index) => {
          acc[`option${index + 1}`] = option;
          return acc;
        }, {} as Record<string, any>);
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
    }
  };

  const removeQuestion = async (id: number) => {
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
            </SelectContent>
          </Select>
        </div>
      </div>
      {newQuestionType === "Single Choice" && (
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
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.text}</TableCell>
              <TableCell>{question.type}</TableCell>
              <TableCell>
                {question.options ? question.options.join(", ") : "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => removeQuestion(question.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
