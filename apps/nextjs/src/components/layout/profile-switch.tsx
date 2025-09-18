"use client";

import React, { useState } from "react";
import { Edit, Plus, Upload, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@galileyo/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import type { CreateProfileData, Profile } from "~/hooks/use-profiles";
import { useProfiles } from "~/hooks/use-profiles";

interface ProfileSwitchProps {
  onProfileSwitch?: (profile: Profile) => void;
  onCreateProfile?: (profile: Profile) => void;
  showCreateButton?: boolean;
  className?: string;
  compact?: boolean;
}

export function ProfileSwitch({
  // onProfileSwitch,
  onCreateProfile,
  showCreateButton = true,
  className = "",
  compact = false,
}: ProfileSwitchProps) {
  const {
    profiles,
    isLoading,
    createProfile,
    // switchProfile,
    deleteProfile,
    updateProfile,
  } = useProfiles();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState<CreateProfileData>({
    name: "",
    role: "user",
    description: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Get the currently active profile
  const getCurrentProfile = () => {
    if (profiles.length === 0) return null;

    const active = profiles.find((p) => p.isActive);
    return active ?? null;
  };

  const currentProfile = getCurrentProfile();

  // const handleProfileSwitch = (profileId: string) => {
  //   try {
  //     const profile = switchProfile(profileId);
  //     if (profile && onProfileSwitch) {
  //       onProfileSwitch(profile);
  //     }
  //   } catch (error) {
  //     console.error("Failed to switch profile:", error);
  //   }
  // };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview("");
  };

  const handleCreateProfile = () => {
    if (!newProfile.name) {
      toast.error("Profile name is required");
      return;
    }

    try {
      const profileData: CreateProfileData = {
        name: newProfile.name,
        role: "user",
        description: newProfile.description,
      };

      const profile = createProfile(profileData);
      if (onCreateProfile) {
        onCreateProfile(profile);
      }

      // Reset form and close dialog
      setNewProfile({ name: "", role: "user", description: "" });
      setProfileImage(null);
      setImagePreview("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setNewProfile({
      name: profile.name,
      role: profile.role,
      description: profile.description ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProfile = () => {
    if (!selectedProfile || !newProfile.name) {
      toast.error("Profile name is required");
      return;
    }

    try {
      updateProfile(selectedProfile.id, newProfile);
      setIsEditDialogOpen(false);
      setSelectedProfile(null);
      setNewProfile({ name: "", role: "user", description: "" });
    } catch (error) {
      console.error("Failed to update profile:", error);
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

  if (!currentProfile) {
    return null;
  }

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border bg-muted/30 p-2 ${className}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
          <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {currentProfile.name}
            </span>
            <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              {getRoleLabel(currentProfile.role)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProfile(currentProfile)}
            className="h-6 w-6 p-0"
            title="Edit Profile"
          >
            <Edit className="h-3 w-3" />
          </Button>

          {showCreateButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-6 w-6 p-0"
              title="Create New Profile"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Create New Profile Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
              <DialogDescription>
                Create a new profile to separate your personal and influencer
                activities.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <Input
                  id="profile-name"
                  placeholder="e.g., Influencer Account"
                  value={newProfile.name}
                  onChange={(e) =>
                    setNewProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="profile-description"
                  placeholder="Brief description of this profile..."
                  value={newProfile.description}
                  onChange={(e) =>
                    setNewProfile((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-image">Profile Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={imagePreview} alt="Preview" />
                      <AvatarFallback>
                        {newProfile.name ? newProfile.name.charAt(0) : "P"}
                      </AvatarFallback>
                    </Avatar>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="profile-image"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {profileImage ? profileImage.name : "Upload image"}
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProfile} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-profile-name">Profile Name</Label>
                <Input
                  id="edit-profile-name"
                  placeholder="e.g., Work Profile"
                  value={newProfile.name}
                  onChange={(e) =>
                    setNewProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-profile-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="edit-profile-description"
                  placeholder="Brief description of this profile..."
                  value={newProfile.description}
                  onChange={(e) =>
                    setNewProfile((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Profile Confirmation */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedProfile?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProfile}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-muted/30 p-3 ${className}`}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
        <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {currentProfile.name}
          </span>
          <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            {getRoleLabel(currentProfile.role)}
          </span>
        </div>
        {currentProfile.description && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {currentProfile.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Profile Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditProfile(currentProfile)}
          className="h-8 w-8 p-0"
          title="Edit Profile"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {showCreateButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-8 w-8 p-0"
            title="Create New Profile"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create New Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Create a new profile to separate your personal and influencer
              activities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                placeholder="e.g., Influencer Account"
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profile-description">
                Description (Optional)
              </Label>
              <Textarea
                id="profile-description"
                placeholder="Brief description of this profile..."
                value={newProfile.description}
                onChange={(e) =>
                  setNewProfile((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profile-image">Profile Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={imagePreview} alt="Preview" />
                    <AvatarFallback>
                      {newProfile.name ? newProfile.name.charAt(0) : "P"}
                    </AvatarFallback>
                  </Avatar>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="profile-image"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      {profileImage ? profileImage.name : "Upload image"}
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProfile} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-profile-name">Profile Name</Label>
              <Input
                id="edit-profile-name"
                placeholder="e.g., Work Profile"
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-profile-description">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-profile-description"
                placeholder="Brief description of this profile..."
                value={newProfile.description}
                onChange={(e) =>
                  setNewProfile((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProfile?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
