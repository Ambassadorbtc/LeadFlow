"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PIPELINE_STAGES } from "@/types/schema";
import { useState } from "react";

type DealFormProps = {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
};

export default function DealForm({
  onSubmit,
  initialData,
  isLoading = false,
}: DealFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    value: initialData?.value || "",
    stage: initialData?.stage || PIPELINE_STAGES[0],
    company: initialData?.company || "",
    closing_date: initialData?.closing_date
      ? new Date(initialData.closing_date).toISOString().split("T")[0]
      : "",
    description: initialData?.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Deal Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter deal name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">Deal Value *</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              placeholder="Enter deal value"
              required
            />
          </div>

          <div>
            <Label htmlFor="stage">Pipeline Stage *</Label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label htmlFor="closing_date">Expected Closing Date</Label>
            <Input
              id="closing_date"
              name="closing_date"
              type="date"
              value={formData.closing_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter deal description"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Deal"
              : "Create Deal"}
        </Button>
      </div>
    </form>
  );
}
