"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronDown,
  CreditCard,
  Handshake,
  LogOut,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import { ThemeToggle } from "@galileyo/ui/theme";

import type { User as AuthUser } from "~/auth/client";
import type { Profile } from "~/hooks/use-profiles";
import { authClient } from "~/auth/client";
import { useProfiles } from "~/hooks/use-profiles";
import { getProfilePicture } from "~/lib/user";

interface UserMenuProps {
  user: AuthUser;
  onlyAvatar?: boolean;
  onProfileSwitch?: (profile: Profile) => void;
}

export function UserMenu({
  user,
  // onProfileSwitch,
  onlyAvatar = false,
}: UserMenuProps) {
  const { profiles, deleteProfile } = useProfiles();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const isTestAccount = user.email.trim().toLowerCase() === "test@galileyo.com";

  // Get the currently active profile or fall back to main user
  const getCurrentProfile = () => {
    const profilePicture = getProfilePicture(user);

    if (profiles.length === 0) {
      return {
        name: user.name,
        avatar: profilePicture,
        role: "user" as const,
        isMainProfile: true,
      };
    }

    const active = profiles.find((p) => p.isActive);
    if (active) {
      return {
        name: active.name,
        avatar: active.avatar,
        role: active.role,
        isMainProfile: active.id === "main",
      };
    }

    // If no active profile, return main user info
    return {
      name: user.name,
      avatar: profilePicture,
      role: "user" as const,
      isMainProfile: true,
    };
  };

  const currentProfile = getCurrentProfile();

  // const handleProfileSwitch = (profileId: string) => {
  //   try {
  //     const profile = switchProfile(profileId);
  //     if (profile && onProfileSwitch) {
  //       onProfileSwitch(profile);
  //     }
  //     // Close dropdown after switching
  //     setIsDropdownOpen(false);
  //   } catch (error) {
  //     console.error("Failed to switch profile:", error);
  //   }
  // };

  const handleDeleteProfile = () => {
    if (!selectedProfile) return;

    try {
      deleteProfile(selectedProfile.id);
      setIsDeleteDialogOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "influencer":
        return "Influencer";
      case "personal":
        return "Personal";
      default:
        return "User";
    }
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={currentProfile.avatar ?? ""}
                alt={currentProfile.name}
              />
              <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {!onlyAvatar && (
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium">
                  {currentProfile.name}
                </span>
                {!currentProfile.isMainProfile && (
                  <span className="text-xs text-muted-foreground">
                    {getRoleLabel(currentProfile.role)} Profile
                  </span>
                )}
              </div>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex flex-col gap-1 p-3">
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={currentProfile.avatar ?? ""}
                  alt={currentProfile.name}
                />
                <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {currentProfile.name}
                </span>
                {!currentProfile.isMainProfile && (
                  <span className="text-xs text-muted-foreground">
                    {getRoleLabel(currentProfile.role)} Profile
                  </span>
                )}
              </div>
            </Link>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-default"
            onSelect={(event) => event.preventDefault()}
          >
            <span>Theme</span>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/my-feeds" className="cursor-pointer">
              <Newspaper className="mr-2 h-4 w-4" />
              My Feeds
            </Link>
          </DropdownMenuItem>

          {user.role === 1 && (
            <DropdownMenuItem asChild>
              <Link href="/members" className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                Members
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/friends" className="cursor-pointer">
              <Handshake className="mr-2 h-4 w-4" />
              Friends
            </Link>
          </DropdownMenuItem>

          {/* Profile Settings */}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Link>
          </DropdownMenuItem>

          {/* Bookmarks */}
          <DropdownMenuItem asChild>
            <Link href="/bookmarks" className="cursor-pointer">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmarks
            </Link>
          </DropdownMenuItem>

          {/* Profile Settings */}
          {!isTestAccount && (
            <DropdownMenuItem asChild>
              <Link href="/payment" className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Details
              </Link>
            </DropdownMenuItem>
          )}

          {/* Sign Out */}
          <DropdownMenuItem onClick={signOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Profile Confirmation */}
      <DropdownMenu
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DropdownMenuContent className="w-80 p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Delete Profile</div>
            <div className="text-xs text-muted-foreground">
              Are you sure you want to delete "{selectedProfile?.name}"? This
              action cannot be undone.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteProfile}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
