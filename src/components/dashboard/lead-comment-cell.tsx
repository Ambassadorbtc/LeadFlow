"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function LeadCommentCell({ leadId }: { leadId: string }) {
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setComment("");
      setShowInput(false);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div
      className="flex items-center text-xs text-gray-500 dark:text-gray-400 min-w-[150px]"
      onClick={(e) => e.stopPropagation()}
    >
      {showInput ? (
        <div className="flex w-full gap-1">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-8 min-h-8 text-xs py-1 px-2"
            placeholder="Add comment..."
          />
          <Button
            size="sm"
            className="h-8 px-2 py-0"
            onClick={handleAddComment}
            disabled={isSubmitting}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex items-center cursor-pointer hover:text-blue-500"
          onClick={() => setShowInput(true)}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          <span>Add Note</span>
        </div>
      )}
    </div>
  );
}
