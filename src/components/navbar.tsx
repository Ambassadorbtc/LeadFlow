"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { User, UserCircle } from "lucide-react";
import UserProfile from "./user-profile";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";

export default function Navbar() {
  const [supabase, setSupabase] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize Supabase client on the client side only
    const initSupabase = async () => {
      const supabaseInstance = createClient();
      setSupabase(supabaseInstance);

      const { data } = await supabaseInstance.auth.getUser();
      setUser(data.user);
    };

    initSupabase();
  }, []);

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2">
          <img
            src="/images/leadflow-logo-with-icon.svg"
            alt="LeadFlow"
            width={150}
            height={40}
          />
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Button>Dashboard</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
