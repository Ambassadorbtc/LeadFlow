"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useState } from "react";

export default function EditLeadForm({ lead }: { lead: any }) {
  const [formData, setFormData] = useState({
    id: lead.id,
    prospect_id: lead.prospect_id,
    business_name: lead.business_name,
    contact_name: lead.contact_name,
    contact_email: lead.contact_email || "",
    phone: lead.phone || "",
    status: lead.status || "New",
    owner: lead.owner || "",
    address: lead.address || "",
    deal_value: lead.deal_value || "",
    bf_interest: lead.bf_interest || false,
    ct_interest: lead.ct_interest || false,
    ba_interest: lead.ba_interest || false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBfCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, bf_interest: checked }));
  };

  const handleCtCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ct_interest: checked }));
  };

  const handleBaCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ba_interest: checked }));
  };

  return (
    <form action="/api/leads/update" method="POST" className="space-y-6">
      <input type="hidden" name="id" value={formData.id} />
      <input
        type="hidden"
        name="bf_interest"
        value={formData.bf_interest ? "true" : "false"}
      />
      <input
        type="hidden"
        name="ct_interest"
        value={formData.ct_interest ? "true" : "false"}
      />
      <input
        type="hidden"
        name="ba_interest"
        value={formData.ba_interest ? "true" : "false"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="prospect_id">Prospect ID *</Label>
            <Input
              id="prospect_id"
              name="prospect_id"
              value={formData.prospect_id}
              onChange={handleChange}
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
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
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
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="New">New</option>
              <option value="Prospect">Prospect</option>
              <option value="Convert">Convert</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="deal_value">Deal Value</Label>
            <Input
              id="deal_value"
              name="deal_value"
              type="number"
              value={formData.deal_value}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bf_interest"
                checked={formData.bf_interest}
                onCheckedChange={handleBfCheckboxChange}
              />
              <Label
                htmlFor="bf_interest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Interested in Business Funding
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ct_interest"
                checked={formData.ct_interest}
                onCheckedChange={handleCtCheckboxChange}
              />
              <Label
                htmlFor="ct_interest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Interested in Card Terminal
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ba_interest"
                checked={formData.ba_interest}
                onCheckedChange={handleBaCheckboxChange}
              />
              <Label
                htmlFor="ba_interest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Interested in Booking App
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href={`/dashboard/leads/${formData.id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
