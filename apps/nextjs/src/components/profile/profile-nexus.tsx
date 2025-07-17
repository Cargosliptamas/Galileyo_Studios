"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  Camera,
  Globe,
  Phone,
  Radio,
  Save,
  Settings,
  Shield,
  Trash2,
  User,
  UserRoundIcon,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Textarea } from "@galileyo/ui/textarea";

import { useTRPC } from "~/trpc/react";

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const trpc = useTRPC();
  const { data: currentUser } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions(),
  );
  // Form states
  const [formData, setFormData] = useState({
    name: currentUser.full_name,
    email: currentUser.email,
    phone: currentUser.phone ?? "",
    location: "",
    language: "English",
    website: "",
    bio: currentUser.about || "",
    photo: currentUser.photo || "",
    timezone: "America/New_York",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    twoFactorEnabled: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the changes to your backend
  };

  const tabs = [
    { id: "general", name: "General", icon: <User className="h-5 w-5" /> },
    { id: "security", name: "Security", icon: <Shield className="h-5 w-5" /> },
    {
      id: "notifications",
      name: "Notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: "devices",
      name: "Connected Devices",
      icon: <Radio className="h-5 w-5" />,
    },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="UserRoundIcon h-24 w-24">
              <AvatarImage
                src={currentUser.photo}
                alt={currentUser.full_name}
              />
              <AvatarFallback>
                <UserRoundIcon
                  size={16}
                  className="opacity-60"
                  aria-hidden="true"
                />
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 rounded-lg bg-blue-500 p-2 transition-colors hover:bg-blue-600">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Profile Picture</h3>
            <p className="text-sm text-gray-400">PNG, JPG or GIF, max 2MB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-medium text-white">Password</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <button className="btn-primary">Update Password</button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={formData.twoFactorEnabled}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  twoFactorEnabled: e.target.checked,
                }))
              }
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
          </label>
        </div>
        {formData.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 p-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-blue-500" />
                <span>Authenticator app configured</span>
              </div>
            </div>
            <button className="text-sm text-gray-400 transition-colors hover:text-white">
              Reconfigure 2FA settings
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Active Sessions</h3>
            <p className="text-sm text-gray-400">
              Manage your active sessions across devices
            </p>
          </div>
          <button className="text-red-400 transition-colors hover:text-red-300">
            Sign out all devices
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-white">
                  Chrome on MacBook Pro
                </div>
                <div className="text-sm text-gray-400">
                  New York, USA • Current session
                </div>
              </div>
            </div>
            <button className="text-gray-400 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-white">iPhone 13 Pro</div>
                <div className="text-sm text-gray-400">
                  Los Angeles, USA • 2 days ago
                </div>
              </div>
            </div>
            <button className="text-gray-400 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="mb-6 text-lg font-medium text-white">
          Notification Preferences
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Email Notifications</h4>
              <p className="text-sm text-gray-400">
                Receive updates and alerts via email
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailNotifications: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Push Notifications</h4>
              <p className="text-sm text-gray-400">
                Receive real-time alerts on your devices
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pushNotifications: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">SMS Notifications</h4>
              <p className="text-sm text-gray-400">
                Receive alerts via text message
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.smsNotifications}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    smsNotifications: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-6 text-lg font-medium text-white">Alert Types</h3>
        <div className="space-y-4">
          <div className="flex items-center rounded-lg bg-white/5 p-4">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="font-medium text-white">Emergency Alerts</label>
              <p className="text-sm text-gray-400">
                Critical updates and emergency notifications
              </p>
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-white/5 p-4">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="font-medium text-white">Weather Updates</label>
              <p className="text-sm text-gray-400">
                Severe weather warnings and forecasts
              </p>
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-white/5 p-4">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="font-medium text-white">System Updates</label>
              <p className="text-sm text-gray-400">
                Maintenance and system status notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeviceSettings = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">
              Connected Devices
            </h3>
            <p className="text-sm text-gray-400">
              Manage your connected SATCOM devices
            </p>
          </div>
          <button
            onClick={() => router.push("/profile/connect-device")}
            className="btn-primary"
          >
            Add Device
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Radio className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-white">Satellite Phone</div>
                <div className="text-sm text-gray-400">
                  Model: ST-165 • Battery: 85%
                </div>
                <div className="mt-1 text-xs text-green-400">
                  Connected • Last active: 2h ago
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-white">Emergency Beacon</div>
                <div className="text-sm text-gray-400">
                  Model: EB-200 • Battery: 92%
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Last active: 5d ago
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-6 text-lg font-medium text-white">Device Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Default Emergency Contact
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number or email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Location Sharing
            </label>
            <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="always">Always</option>
              <option value="emergency">Emergency Only</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="glass-card">
          <div className="border-b border-white/10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Profile Settings
                </h2>
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 transition-colors hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="h-5 w-5" />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Settings className="h-5 w-5" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "general" && renderGeneralSettings()}
            {activeTab === "security" && renderSecuritySettings()}
            {activeTab === "notifications" && renderNotificationSettings()}
            {activeTab === "devices" && renderDeviceSettings()}
          </div>

          {activeTab === "general" && (
            <div className="border-t border-white/10 p-6">
              <div className="glass-card bg-red-500/10 p-6">
                <h3 className="mb-2 text-lg font-medium text-red-400">
                  Danger Zone
                </h3>
                <p className="mb-4 text-gray-300">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card mx-4 w-full max-w-md p-6">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Delete Account
            </h3>
            <p className="mb-4 text-gray-300">
              Are you sure you want to delete your account? All of your data
              will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
