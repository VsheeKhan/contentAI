"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch } from "../utils/authFetch";
import { PersonaPreview } from "./persona-preview";

type QuestionType = "text" | "textarea" | "radio" | "single_choice" | "mcq";

interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
}

interface Answer {
  [question: string]: string;
}

export default function PersonaSurvey() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generatedPersona, setGeneratedPersona] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const router = useRouter();

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
      const questionsToAdd: Question[] = data.map((question) => ({
        id: question._id,
        question: question.question,
        type: question.questionType,
        options: question.options ? Object.values(question.options) : undefined,
      }));
      setQuestions([...questions, ...questionsToAdd]);
      setAnswers(data.map((q) => ({ [q.question]: "" })));
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateAnswer = (
    questionType: QuestionType,
    answer: string
  ): boolean => {
    switch (questionType) {
      case "text":
        if (
          !answer ||
          (typeof answer === "string" && answer.trim().length === 0)
        ) {
          setValidationError("This field cannot be empty");
          return false;
        }
        break;
      case "radio":
      case "single_choice":
        if (!answer) {
          setValidationError("Please select an option");
          return false;
        }
        break;
      case "mcq":
        if (!answer || answer.split(",").filter(Boolean).length === 0) {
          setValidationError("Please select at least one option");
          return false;
        }
        break;
      default:
        return false;
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    const currentQuestionData = questions[currentQuestion];
    const currentAnswer =
      answers[currentQuestion][currentQuestionData.question];

    if (!validateAnswer(currentQuestionData.type, currentAnswer)) {
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const question = questions[currentQuestion].question;
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestion] = { [question]: event.target.value };
      return newAnswers;
    });
    setValidationError(null);
  };

  const handleRadioChange = (value: string) => {
    const question = questions[currentQuestion].question;
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestion] = { [question]: value };
      return newAnswers;
    });
    setValidationError(null);
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const question = questions[currentQuestion].question;
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const currentAnswer = newAnswers[currentQuestion][question];
      const currentOptions = currentAnswer
        ? currentAnswer.split(",").filter(Boolean)
        : [];
      let newOptions: string[];

      if (checked) {
        newOptions = [...currentOptions, option];
      } else {
        newOptions = currentOptions.filter((item) => item !== option);
      }

      newAnswers[currentQuestion] = { [question]: newOptions.join(",") };
      return newAnswers;
    });
    setValidationError(null);
  };

  const handleFinish = async () => {
    const currentQuestionData = questions[currentQuestion];
    const currentAnswer =
      answers[currentQuestion][currentQuestionData.question];

    if (!validateAnswer(currentQuestionData.type, currentAnswer)) {
      return;
    }

    console.log("Survey completed:", answers);
    setError(null);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queryPrompt: answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate persona");
      }

      const data = await response.json();
      setGeneratedPersona(data.persona);
    } catch (error) {
      console.error("Error generating persona:", error);
      setError("Failed to generate persona. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePersona = () => {
    router.push("/home/plans/trial");
  };

  const handleCancelPersona = () => {
    // setGeneratedPersona(null);
    resetSurvey();
  };

  const resetSurvey = () => {
    setCurrentQuestion(0);
    setAnswers(questions.map((q) => ({ [q.question]: "" })));
    setGeneratedPersona(null);
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const answer = answers[currentQuestion][question.question];

    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={`question-${currentQuestion}`}>
              {question.question}
            </Label>
            <Input
              id={`question-${currentQuestion}`}
              value={answer}
              onChange={handleInputChange}
            />
          </div>
        );
      case "radio":
      case "single_choice":
        return (
          <div className="space-y-2">
            <Label>{question.question}</Label>
            <RadioGroup value={answer} onValueChange={handleRadioChange}>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case "mcq":
        return (
          <div className="space-y-2">
            <Label>{question.question}</Label>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={answer.split(",").includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(option, checked as boolean)
                  }
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        <div className="text-center">Loading questions</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center">No questions available.</div>;
  }

  if (generatedPersona) {
    return (
      <PersonaPreview
        persona={generatedPersona}
        onSave={handleSavePersona}
        onCancel={handleCancelPersona}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Persona Survey</h1>
      <div className="space-y-4">
        {renderQuestion()}
        {validationError && (
          <div className="text-red-500">{validationError}</div>
        )}
      </div>
      <div className="flex justify-between">
        <Button onClick={handleBack} disabled={currentQuestion === 0}>
          Back
        </Button>
        {currentQuestion === questions.length - 1 ? (
          <Button onClick={handleFinish} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Finish"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Question {currentQuestion + 1} of {questions.length}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
