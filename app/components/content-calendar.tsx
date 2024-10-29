import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SchedulePost from "./schedule-post";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Post } from "../contexts/posts-context";

interface ContentCalendarProps {
  scheduledPosts: Post[];
  handleReschedulePost: (
    requestBody: { content: string; scheduleDate: Date },
    postId: string
  ) => Promise<void>;
  handleCancelScheduledPost: (postId: string) => Promise<void>;
}

export default function ContentCalendar({
  scheduledPosts,
  handleReschedulePost,
  handleCancelScheduledPost,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [scheduleStates, setScheduleStates] = useState<
    {
      isOpen: boolean;
      selectedDate: Date;
      currentMonth: number;
      currentYear: number;
    }[]
  >([]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const newStates = scheduledPosts.map((post) => ({
      isOpen: false,
      selectedDate: post.scheduleDate
        ? parseISO(post.scheduleDate)
        : new Date(),
      currentMonth: post.scheduleDate
        ? parseISO(post.scheduleDate).getMonth()
        : new Date().getMonth(),
      currentYear: post.scheduleDate
        ? parseISO(post.scheduleDate).getFullYear()
        : new Date().getFullYear(),
    }));
    setScheduleStates(newStates);
  }, [scheduledPosts]);

  const getPlatformColor = (
    platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram"
  ): string => {
    switch (platform) {
      case "Facebook":
        return "bg-blue-500 text-white";
      case "Twitter":
        return "bg-gray-800 text-white";
      case "LinkedIn":
        return "bg-violet-600 text-white";
      case "Instagram":
        return "bg-pink-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const renderPostIcon = (post: Post) => (
    <TooltipProvider key={post.id}>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`text-xs rounded-full w-6 h-6 cursor-pointer hover:opacity-80 flex items-center justify-center ${getPlatformColor(
              post.platform
            )}`}
            onClick={() => handleOpenContentViewer(post)}
          >
            {getPlatformIcon(post.platform)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{post.content.substring(0, 50)}...</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayHeaders = daysOfWeek.map((dayOfWeek) => (
      <div
        key={dayOfWeek}
        className="text-center font-bold p-1 md:p-2 text-xs sm:text-sm"
      >
        {dayOfWeek}
      </div>
    ));
    rows.push(
      <div className="grid grid-cols-7 gap-px bg-gray-200" key="header">
        {dayHeaders}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayPosts = scheduledPosts.filter((post) => {
          if (
            post.scheduleDate &&
            !post.isCanceled &&
            scheduleStates.length > 0
          )
            return (
              post.scheduleDate &&
              isSameDay(parseISO(post.scheduleDate), cloneDay)
            );
        });
        const dayId = day.toISOString();
        const visiblePosts = windowWidth > 768 ? 2 : 1;

        days.push(
          <div
            className={`bg-white p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] relative ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSameDay(day, new Date())
                ? "bg-blue-100"
                : ""
            }`}
            key={dayId}
          >
            <span className="text-xs sm:text-sm font-medium">
              {formattedDate}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {dayPosts.slice(0, visiblePosts).map(renderPostIcon)}
            </div>
            {dayPosts.length > visiblePosts && (
              <Popover
                open={openPopoverId === dayId}
                onOpenChange={(open) => setOpenPopoverId(open ? dayId : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-xs font-medium text-gray-500 w-6 h-6 p-0 absolute bottom-1 right-1"
                  >
                    +{dayPosts.length - visiblePosts}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex flex-wrap gap-2">
                    {dayPosts.slice(visiblePosts).map(renderPostIcon)}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div
          className="grid grid-cols-7 gap-px bg-gray-200"
          key={day.toString()}
        >
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">{rows}</div>
    );
  };

  const handleOpenContentViewer = (post: Post) => {
    const postIndex = scheduledPosts.findIndex((p) => p.id === post.id);
    setSelectedPost(post);
    setSelectedPostIndex(postIndex);
    setIsContentViewerOpen(true);
    if (postIndex !== -1 && post.scheduleDate) {
      const scheduledDate = parseISO(post.scheduleDate);
      setScheduleStates((prev) =>
        prev.map((state, index) =>
          index === postIndex
            ? {
                ...state,
                selectedDate: scheduledDate,
                currentMonth: scheduledDate.getMonth(),
                currentYear: scheduledDate.getFullYear(),
              }
            : state
        )
      );
    }
  };

  const onCancelScheduledPost = async () => {
    if (selectedPost) {
      await handleCancelScheduledPost(selectedPost.id);
      setIsContentViewerOpen(false);
    }
  };

  const onReschedulePost = async (index: number) => {
    if (selectedPost && index != -1) {
      // const newScheduleDate = scheduleStates[index].selectedDate.toISOString();
      await handleReschedulePost(
        {
          content: selectedPost.content,
          scheduleDate: scheduleStates[index].selectedDate,
        },
        scheduledPosts[index].id
      );
      const newIndex = scheduledPosts.findIndex(
        (post) => post.id === selectedPost.id
      );
      setSelectedPostIndex(newIndex);
      setIsContentViewerOpen(false);
      setSelectedPost(null);
    }
  };

  const getPlatformIcon = (
    platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram"
  ) => {
    switch (platform) {
      case "Facebook":
        return <Facebook className="h-4 w-4" />;
      case "Twitter":
        return <Twitter className="h-4 w-4" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4" />;
      case "Instagram":
        return <Instagram className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-center items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">{renderCalendar()}</CardContent>
      </Card>
      <Dialog open={isContentViewerOpen} onOpenChange={setIsContentViewerOpen}>
        <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Scheduled Post</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4">
            <div className="py-4">
              <p className="mb-4 whitespace-pre-wrap">
                {selectedPost?.content || ""}
              </p>
              <div className="flex flex-col p-2 pl-0 rounded gap-2">
                {selectedPost && getPlatformIcon(selectedPost.platform)}
                <p className="text-sm text-gray-500">
                  {selectedPost &&
                    selectedPost.createdAt &&
                    `Created At: ${format(
                      parseISO(selectedPost.createdAt),
                      "MMMM d, yyyy"
                    )}`}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPost &&
                    selectedPost.scheduleDate &&
                    `Scheduled for: ${format(
                      parseISO(selectedPost.scheduleDate),
                      "MMMM d, yyyy"
                    )}`}
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
            <SchedulePost
              buttonName="Reschedule Post"
              generatedIndex={selectedPostIndex ?? -1}
              onSchedulePost={onReschedulePost}
              scheduleStates={scheduleStates}
              setScheduleStates={setScheduleStates}
            />
            <Button variant="destructive" onClick={onCancelScheduledPost}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel Scheduled Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
