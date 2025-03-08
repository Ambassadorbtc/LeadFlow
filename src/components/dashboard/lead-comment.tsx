"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Save, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "../../../supabase/client";

export default function LeadComment({ leadId }: { leadId: string }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const supabase = createClient();

  const handleSaveComment = async () => {
    try {
      // In a real implementation, you would save this to a comments table
      // For now, we'll just update the UI
      setSavedComment(comment);
      setIsCommenting(false);

      // This would be the actual database update
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return;
      //
      // const { error } = await supabase
      //   .from('lead_comments')
      //   .insert({ lead_id: leadId, comment, user_id: user.id });
      //
      // if (error) throw error;
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  if (isCommenting) {
    return (
      <div className="flex items-center space-x-1">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="h-6 text-xs py-1 px-2"
          placeholder="Add comment..."
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleSaveComment}
        >
          <Save className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => setIsCommenting(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (savedComment) {
    return (
      <div className="flex items-center">
        <div className="text-xs text-gray-600 truncate max-w-[120px]">
          {savedComment}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 ml-1"
          onClick={() => setIsCommenting(true)}
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-6 w-6"
      onClick={() => setIsCommenting(true)}
    >
      <MessageSquare className="h-3 w-3" />
    </Button>
  );
}
