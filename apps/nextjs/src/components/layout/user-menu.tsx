"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronDown,
  LogOut,
  MoreHorizontal,
  Settings,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";

import type { User as AuthUser } from "~/auth/client";
import type { Profile } from "~/hooks/use-profiles";
import { authClient } from "~/auth/client";
import { useProfiles } from "~/hooks/use-profiles";
import { getProfilePicture } from "~/lib/user";

interface UserMenuProps {
  user: AuthUser;
  onProfileSwitch?: (profile: Profile) => void;
}

export function UserMenu({ user, onProfileSwitch }: UserMenuProps) {
  const { profiles, switchProfile, deleteProfile } = useProfiles();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

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

  const handleProfileSwitch = (profileId: string) => {
    try {
      const profile = switchProfile(profileId);
      if (profile && onProfileSwitch) {
        onProfileSwitch(profile);
      }
      // Close dropdown after switching
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to switch profile:", error);
    }
  };

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
            <div className="hidden flex-col items-start text-left md:flex">
              <span className="text-sm font-medium">{currentProfile.name}</span>
              {!currentProfile.isMainProfile && (
                <span className="text-xs text-muted-foreground">
                  {getRoleLabel(currentProfile.role)} Profile
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex flex-col gap-1 p-3">
            <div className="flex items-center gap-3">
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
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Profile List */}
          <div className="p-2">
            <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
              Switch Profile
            </div>
            {profiles.map((profile) => (
              <div key={profile.id} className="group relative">
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-3 p-2"
                  onClick={() => handleProfileSwitch(profile.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {profile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getRoleLabel(profile.role)}
                    </span>
                  </div>
                  {profile.isActive && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </DropdownMenuItem>

                {/* Profile Actions */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedProfile(profile);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Profile
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>
            ))}
          </div>

          <DropdownMenuSeparator />

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
