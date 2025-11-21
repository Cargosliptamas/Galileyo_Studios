import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { toast } from "@galileyo/ui/toast";

import { getFollowerListImageUrl, getInfluencerImageUrl } from "~/lib/image";
import { useTRPC } from "~/trpc/react";

export type ProfileTypes = "user" | "influencer" | "follower_list";

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  role: ProfileTypes;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface CreateProfileData {
  name: string;
  role: ProfileTypes;
  description?: string;
  avatar?: string;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const trpc = useTRPC();

  const { data: availableProfiles, isLoading: isProfilesLoading } = useQuery(
    trpc.profile.getProfiles.queryOptions(),
  );

  // Create a new profile
  const createProfile = useCallback(
    (profileData: CreateProfileData) => {
      // setIsLoading(true);
      try {
        const newProfile: Profile = {
          id: Date.now().toString(), // Simple ID generation
          ...profileData,
          isActive: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProfiles = [...profiles, newProfile];
        setProfiles(updatedProfiles);

        // Save to localStorage
        localStorage.setItem("user-profiles", JSON.stringify(updatedProfiles));

        toast.success(`Profile "${profileData.name}" created successfully`);
        return newProfile;
      } catch (error) {
        console.error("Failed to create profile:", error);
        toast.error("Failed to create profile");
        throw error;
      } finally {
        // setIsLoading(false);
      }
    },
    [profiles],
  );

  // Switch to a different profile
  const switchProfile = useCallback(
    (profileId: string, showToast = true) => {
      // setIsLoading(true);
      try {
        const updatedProfiles = profiles.map((profile) => ({
          ...profile,
          isActive: profile.id === profileId,
        }));

        setProfiles(updatedProfiles);
        setActiveProfile(profileId);

        // Save to localStorage
        localStorage.setItem("user-profiles", JSON.stringify(updatedProfiles));

        const profile = updatedProfiles.find((p) => p.id === profileId);
        if (showToast) {
          toast.success(`Switched to profile: ${profile?.name}`);
        }

        return profile;
      } catch (error) {
        console.error("Failed to switch profile:", error);
        if (showToast) {
          toast.error("Failed to switch profile");
        }
        throw error;
      } finally {
        // setIsLoading(false);
      }
    },
    [profiles],
  );

  // Delete a profile
  const deleteProfile = useCallback(
    (profileId: string) => {
      // setIsLoading(true);
      try {
        const profileToDelete = profiles.find((p) => p.id === profileId);
        if (!profileToDelete) {
          throw new Error("Profile not found");
        }

        // Don't allow deleting the active profile
        if (profileToDelete.isActive) {
          throw new Error("Cannot delete active profile");
        }

        const updatedProfiles = profiles.filter((p) => p.id !== profileId);
        setProfiles(updatedProfiles);

        // Save to localStorage
        localStorage.setItem("user-profiles", JSON.stringify(updatedProfiles));

        toast.success(`Profile "${profileToDelete.name}" deleted successfully`);
      } catch (error) {
        console.error("Failed to delete profile:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete profile",
        );
        throw error;
      } finally {
        // setIsLoading(false);
      }
    },
    [profiles],
  );

  // Update a profile
  const updateProfile = useCallback(
    (profileId: string, updates: Partial<Profile>) => {
      // setIsLoading(true);
      try {
        const updatedProfiles = profiles.map((profile) =>
          profile.id === profileId ? { ...profile, ...updates } : profile,
        );

        setProfiles(updatedProfiles);

        // Save to localStorage
        localStorage.setItem("user-profiles", JSON.stringify(updatedProfiles));

        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile");
        throw error;
      } finally {
        // setIsLoading(false);
      }
    },
    [profiles],
  );

  // Get current active profile
  const getActiveProfile = useCallback(() => {
    return profiles.find((p) => p.isActive) ?? profiles[0];
  }, [profiles]);

  const isLoading = isProfilesLoading;

  useEffect(() => {
    if (availableProfiles?.subscriptions) {
      setProfiles((prevProfiles) => [
        ...prevProfiles.filter(
          (p) => !availableProfiles.subscriptions.some((s) => s.id === p.id),
        ),
        ...availableProfiles.subscriptions.map((subscription) => ({
          id: subscription.id,
          name: subscription.title,
          avatar: getInfluencerImageUrl(subscription.meta.image) ?? undefined,
          role: "influencer" as const,
          isActive: false,
          createdAt: new Date().toISOString(),
        })),
      ]);
    }

    if (availableProfiles?.private_feeds) {
      setProfiles((prevProfiles) => [
        ...prevProfiles.filter(
          (p) => !availableProfiles.private_feeds.some((f) => f.id === p.id),
        ),
        ...availableProfiles.private_feeds.map((feed) => ({
          id: feed.id,
          name: feed.title,
          avatar: getFollowerListImageUrl(feed.meta.image) ?? undefined,
          role: "follower_list" as const,
          isActive: false,
          createdAt: new Date().toISOString(),
        })),
      ]);
    }
  }, [availableProfiles?.subscriptions, availableProfiles?.private_feeds]);

  return {
    profiles,
    activeProfile,
    isLoading,
    createProfile,
    switchProfile,
    deleteProfile,
    updateProfile,
    getActiveProfile,
  };
}
