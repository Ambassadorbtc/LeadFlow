"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";

export default function LeadCommentCell({ leadId }: { leadId: string }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const [bfInterest, setBfInterest] = useState(false);
  const supabase = createClient();

  // Fetch interest status and comments on load
  useEffect(() => {
    const fetchLeadData = async () => {
      // Fetch lead interest data
      const { data } = await supabase
        .from("leads")
        .select("bf_interest, ct_interest, ba_interest")
        .eq("id", leadId)
        .single();

      if (data) {
        setBfInterest(data.bf_interest || false);
        setCtInterest(data.ct_interest || false);
        setBaInterest(data.ba_interest || false);
      }

      // Fetch comments for this lead
      const { data: commentsData } = await supabase
        .from("lead_comments")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (commentsData && commentsData.length > 0) {
        setSavedComment(commentsData[0].comment);
      }
    };

    fetchLeadData();
  }, [leadId, supabase]);

  // State for interest types
  const [ctInterest, setCtInterest] = useState(false);
  const [baInterest, setBaInterest] = useState(false);

  // Handle BF interest toggle
  const handleBfInterestChange = async (checked: boolean) => {
    setBfInterest(checked);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ bf_interest: checked })
        .eq("id", leadId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating BF interest:", error);
      setBfInterest(!checked); // Revert on error
    }
  };

  // Handle CT interest toggle
  const handleCtInterestChange = async (checked: boolean) => {
    setCtInterest(checked);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ ct_interest: checked })
        .eq("id", leadId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating CT interest:", error);
      setCtInterest(!checked); // Revert on error
    }
  };

  // Handle BA interest toggle
  const handleBaInterestChange = async (checked: boolean) => {
    setBaInterest(checked);

    try {
      const { error } = await supabase
        .from("leads")
        .update({ ba_interest: checked })
        .eq("id", leadId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating BA interest:", error);
      setBaInterest(!checked); // Revert on error
    }
  };

  const handleSaveComment = async () => {
    try {
      if (!comment.trim()) {
        setIsCommenting(false);
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Save to database
      const { error } = await supabase.from("lead_comments").insert({
        lead_id: leadId,
        comment,
        user_id: user.id,
      });

      if (error) throw error;

      // Update UI
      setSavedComment(comment);
      setIsCommenting(false);
      setComment("");
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  // Handle click event without propagation to parent
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCommenting(true);
  };

  if (isCommenting) {
    return (
      <div
        className="flex items-center space-x-1"
        onClick={(e) => e.stopPropagation()}
      >
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
          onClick={(e) => {
            e.stopPropagation();
            handleSaveComment();
          }}
        >
          <Save className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommenting(false);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      {/* Interest Checkboxes */}
      <div className="flex items-center space-x-2 mr-2">
        <div className="flex items-center">
          <Checkbox
            id={`bf-interest-${leadId}`}
            checked={bfInterest}
            onCheckedChange={handleBfInterestChange}
            className="h-3 w-3"
          />
          <label
            htmlFor={`bf-interest-${leadId}`}
            className="ml-1 text-xs text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            BF
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            id={`ba-interest-${leadId}`}
            className="h-3 w-3"
            checked={baInterest}
            onCheckedChange={handleBaInterestChange}
          />
          <label
            htmlFor={`ba-interest-${leadId}`}
            className="ml-1 text-xs text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            BA
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            id={`ct-interest-${leadId}`}
            className="h-3 w-3"
            checked={ctInterest}
            onCheckedChange={handleCtInterestChange}
          />
          <label
            htmlFor={`ct-interest-${leadId}`}
            className="ml-1 text-xs text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            CT
          </label>
        </div>
      </div>

      {/* Comment section */}
      {savedComment ? (
        <div className="flex items-center group relative">
          <div className="text-xs text-gray-600 truncate max-w-[80px] cursor-default">
            {savedComment}
          </div>
          {/* Custom tooltip that matches site design */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-md p-2 text-xs text-[#111827] max-w-[200px] whitespace-normal">
              {savedComment}
            </div>
            <div className="w-2 h-2 bg-white border-b border-r border-[#e5e7eb] transform rotate-45 absolute -bottom-1 left-4"></div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 ml-1"
            onClick={handleClick}
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleClick}
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
