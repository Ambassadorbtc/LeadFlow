"use client";

import { MessageCircle, Send, Save, X } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function LeadCommentCell({ leadId }: { leadId: string }) {
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedComment, setSavedComment] = useState("");

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSavedComment(comment);
      setComment("");
      setShowInput(false);
      setIsSubmitting(false);
    }, 500);
  };

  const handleDeleteComment = () => {
    setSavedComment("");
  };

  const handleCancel = () => {
    setComment("");
    setShowInput(false);
  };

  return (
    <div
      className="flex items-center text-xs text-gray-500 dark:text-gray-400 min-w-[200px] w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {showInput ? (
        <div className="flex w-full gap-1">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-8 min-h-8 text-xs py-1 px-2 flex-grow"
            placeholder="Add comment..."
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              className="h-4 w-6 px-1 py-0 bg-green-600 hover:bg-green-700"
              onClick={handleAddComment}
              disabled={isSubmitting}
              title="Save"
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="h-4 w-6 px-1 py-0 bg-gray-500 hover:bg-gray-600"
              onClick={handleCancel}
              disabled={isSubmitting}
              title="Cancel"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : savedComment ? (
        <div className="flex w-full justify-between items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
          <span className="text-xs text-gray-700 dark:text-gray-300 truncate mr-2">
            {savedComment}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                setComment(savedComment);
                setShowInput(true);
              }}
              title="Edit"
            >
              <MessageCircle className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="h-5 w-5 p-0 bg-red-500 hover:bg-red-600"
              onClick={handleDeleteComment}
              title="Delete"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center cursor-pointer hover:text-blue-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded w-full"
          onClick={() => setShowInput(true)}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          <span>Add Note</span>
        </div>
      )}
    </div>
  );
}
