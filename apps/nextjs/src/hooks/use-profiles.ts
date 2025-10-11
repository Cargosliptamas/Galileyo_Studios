import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  role: "user" | "influencer" | "personal";
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface CreateProfileData {
  name: string;
  role: "user" | "influencer" | "personal";
  description?: string;
  avatar?: string;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const trpc = useTRPC();

  const { data: privateFeeds, isLoading: isPrivateFeedsLoading } = useQuery(
    trpc.feed.getPrivateFeeds.queryOptions(),
  );
  const { data: influencerFeeds, isLoading: isInfluencerFeedsLoading } =
    useQuery(trpc.feed.getInfluencerFeeds.queryOptions());

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

  const isLoading = isPrivateFeedsLoading || isInfluencerFeedsLoading;

  useEffect(() => {
    if (privateFeeds && privateFeeds.length > 0) {
      const ids = privateFeeds.map((feed) => feed.id.toString());

      setProfiles((prevProfiles) => [
        ...prevProfiles.filter((p) => !ids.includes(p.id)),
        ...privateFeeds.map((feed) => ({
          id: feed.id.toString(),
          name: feed.title,
          avatar: feed.image ?? undefined,
          role: "user" as Profile["role"],
          isActive: false,
          createdAt: new Date().toISOString(),
        })),
      ]);
    }
  }, [privateFeeds]);

  useEffect(() => {
    if (influencerFeeds && influencerFeeds.list.length > 0) {
      const ids = influencerFeeds.list.map((feed) => feed.id.toString());

      setProfiles((prevProfiles) => [
        ...prevProfiles.filter((p) => !ids.includes(p.id)),
        ...influencerFeeds.list.map((feed) => ({
          id: feed.id.toString(),
          name: feed.title,
          avatar: feed.image ?? undefined,
          role: "influencer" as Profile["role"],
          isActive: false,
          createdAt: new Date().toISOString(),
        })),
      ]);
    }
  }, [influencerFeeds]);

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
