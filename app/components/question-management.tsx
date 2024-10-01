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

type QuestionType = "Input text" | "Single Choice" | "Yes/No";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
}

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "What's your favorite feature of our product?",
      type: "Input text",
    },
    {
      id: 2,
      text: "How has our service improved your workflow?",
      type: "Input text",
    },
    {
      id: 3,
      text: "Would you recommend our product to a friend?",
      type: "Yes/No",
    },
    {
      id: 4,
      text: "Which of the following best describes your role?",
      type: "Single Choice",
      options: ["Developer", "Designer", "Manager", "Other"],
    },
    { id: 5, text: "What's one feature you wish we had?", type: "Input text" },
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionType, setNewQuestionType] =
    useState<QuestionType>("Input text");
  const [newOptions, setNewOptions] = useState("");

  const addQuestion = () => {
    if (newQuestion) {
      const questionToAdd: Question = {
        id: questions.length + 1,
        text: newQuestion,
        type: newQuestionType,
      };
      if (newQuestionType === "Single Choice" && newOptions) {
        questionToAdd.options = newOptions
          .split(",")
          .map((option) => option.trim());
      }
      setQuestions([...questions, questionToAdd]);
      setNewQuestion("");
      setNewOptions("");
    }
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-4">
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
