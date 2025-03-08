"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type LeadFormProps = {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
};

export default function LeadForm({
  onSubmit,
  initialData,
  isLoading = false,
}: LeadFormProps) {
  const [formData, setFormData] = useState({
    prospect_id: initialData?.prospect_id || "",
    business_name: initialData?.business_name || "",
    contact_name: initialData?.contact_name || "",
    contact_email: initialData?.contact_email || "",
    address: initialData?.address || "",
    owner: initialData?.owner || "",
    status: initialData?.status || "New",
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
          <Label htmlFor="prospect_id">Prospect ID *</Label>
          <Input
            id="prospect_id"
            name="prospect_id"
            value={formData.prospect_id}
            onChange={handleChange}
            placeholder="Enter unique prospect ID"
            required
          />
        </div>

        <div>
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            placeholder="Enter business name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Enter contact name"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="Enter contact email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter business address"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Enter lead owner"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
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
              ? "Update Lead"
              : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
