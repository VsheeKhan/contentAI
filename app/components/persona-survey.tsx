"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authFetch } from "../utils/authFetch";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = "text" | "single_choice" | "mcq" | "radio";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface Answers {
  [key: number]: string;
}

export default function PersonaSurvey() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      const questionsToAdd: Array<Question> = data.map((question: any) => ({
        id: question._id,
        text: question.question,
        type: question.questionType,
        options: question.options ? Object.values(question.options) : undefined,
      }));
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

  const validateAnswer = (
    questionType: QuestionType,
    answer: string | string[] | undefined
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
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
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
    const currentAnswer = answers[currentQuestion];

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [currentQuestion]: event.target.value,
    });
    setValidationError(null);
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentAnswer = answers[currentQuestion] || "";
    const answerArray = currentAnswer.split(",").filter(Boolean);

    if (checked) {
      answerArray.push(option);
    } else {
      const index = answerArray.indexOf(option);
      if (index > -1) {
        answerArray.splice(index, 1);
      }
    }

    setAnswers({
      ...answers,
      [currentQuestion]: answerArray.join(","),
    });
    setValidationError(null);
  };

  const handleRadioChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value,
    });
    setValidationError(null);
  };

  const handleFinish = () => {
    const currentQuestionData = questions[currentQuestion];
    const currentAnswer = answers[currentQuestion];

    if (!validateAnswer(currentQuestionData.type, currentAnswer)) {
      return;
    }

    setValidationError(null);
    console.log("Survey completed:", answers);
    // Here you would typically send the answers to your server or perform any other action
    alert("Thank you for completing the survey!");
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={`question-${currentQuestion}`}>
              {question.text}
            </Label>
            <Input
              id={`question-${currentQuestion}`}
              value={answers[currentQuestion] || ""}
              onChange={handleInputChange}
            />
          </div>
        );
      case "single_choice":
      case "radio":
        return (
          <div className="space-y-2">
            <Label>{question.text}</Label>
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleRadioChange}
            >
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
            <Label>{question.text}</Label>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(answers[currentQuestion] || "")
                    .split(",")
                    .includes(option)}
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

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center">No questions available</div>;
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
          <Button onClick={handleFinish}>Finish</Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Question {currentQuestion + 1} of {questions.length}
      </div>
    </div>
  );
}
