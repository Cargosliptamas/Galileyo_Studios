"use client";

import React, { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  Battery,
  Bell,
  Camera,
  Clock,
  Download,
  Eye,
  EyeOff,
  // Calendar,
  Globe,
  Key,
  Laptop,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Monitor,
  // Signal,
  MoreHorizontal,
  Phone,
  Save,
  Shield,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
  User,
  UserRoundIcon,
  Wifi,
  X,
} from "lucide-react";

import { ProfileGeneralSchema } from "@galileyo/api/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@galileyo/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@galileyo/ui/form";
import { Input } from "@galileyo/ui/input";
import { Label } from "@galileyo/ui/label";
import { Separator } from "@galileyo/ui/separator";
import { Switch } from "@galileyo/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@galileyo/ui/tabs";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

interface Device {
  id: number;
  name: string;
  type: "mobile" | "desktop" | "tablet";
  os: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
  batteryLevel?: number;
  signalStrength: "excellent" | "good" | "fair" | "poor";
}

export function Profile() {
  const trpc = useTRPC();

  const { data: currentUser } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions(),
  );

  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generalForm = useForm({
    schema: ProfileGeneralSchema,
    defaultValues: {
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      email: currentUser.email,
      about: currentUser.about,
      country: currentUser.country,
      state: currentUser.state,
      zip: currentUser.zip,
      // phone: currentUser.phone ?? '',
    },
  });

  const queryClient = useQueryClient();
  const updateProfile = useMutation(
    trpc.profile.updateProfile.mutationOptions({
      onSuccess: async (data) => {
        generalForm.reset(data);
        await queryClient.invalidateQueries(trpc.profile.pathFilter());
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile");
      },
    }),
  );

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    loginAlerts: true,
    sessionTimeout: "30",
    trustedDevices: true,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    emergencyAlerts: true,
    networkUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "07:00",
    },
  });

  // Connected Devices State
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 1,
      name: "iPhone 15 Pro",
      type: "mobile",
      os: "iOS 17.2",
      browser: "Safari",
      location: "Houston, TX",
      lastActive: "Active now",
      isCurrentDevice: true,
      batteryLevel: 85,
      signalStrength: "excellent",
    },
    {
      id: 2,
      name: "MacBook Pro",
      type: "desktop",
      os: "macOS Sonoma",
      browser: "Chrome",
      location: "Houston, TX",
      lastActive: "2 hours ago",
      isCurrentDevice: false,
      signalStrength: "excellent",
    },
    {
      id: 3,
      name: "iPad Air",
      type: "tablet",
      os: "iPadOS 17.2",
      browser: "Safari",
      location: "Dallas, TX",
      lastActive: "1 day ago",
      isCurrentDevice: false,
      batteryLevel: 62,
      signalStrength: "good",
    },
    {
      id: 4,
      name: "Windows Desktop",
      type: "desktop",
      os: "Windows 11",
      browser: "Edge",
      location: "Austin, TX",
      lastActive: "3 days ago",
      isCurrentDevice: false,
      signalStrength: "fair",
    },
  ]);

  const handleDeviceRemove = (deviceId: number) => {
    setDevices(devices.filter((device) => device.id !== deviceId));
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      case "desktop":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getSignalBars = (strength: string) => {
    const bars = [];
    const levels = { excellent: 4, good: 3, fair: 2, poor: 1 };
    const level = levels[strength as keyof typeof levels] || 0;

    for (let i = 0; i < 4; i++) {
      bars.push(
        <div
          key={i}
          className={`h-3 w-1 rounded-full ${
            i < level
              ? getSignalColor(strength)
              : "bg-slate-300 dark:bg-slate-600"
          } bg-current`}
        />,
      );
    }
    return bars;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Profile Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account preferences and security settings
              </p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 rounded-xl border border-slate-200 bg-white/50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
            <TabsTrigger
              value="general"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <User className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Devices
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="UserRoundIcon h-24 w-24">
                      <AvatarImage
                        src={currentUser.photo}
                        alt={currentUser.full_name}
                      />
                      <AvatarFallback>
                        <UserRoundIcon
                          className="opacity-60"
                          aria-hidden="true"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-2 -right-2 transform rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:from-cyan-400 hover:to-blue-400">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                      Profile Picture
                    </h3>
                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                      Update your profile picture to personalize your account
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Upload className="mr-2 inline h-4 w-4" />
                        Upload New
                      </Button>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 inline h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Personal Information */}
                <Form {...generalForm}>
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={generalForm.handleSubmit((data) => {
                      updateProfile.mutate(data);
                    })}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="First Name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Last Name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="me@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              placeholder="Bio"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={securitySettings.currentPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={securitySettings.newPassword}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            newPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={securitySettings.confirmPassword}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  Security Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorEnabled: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get notified of new login attempts
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            loginAlerts: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Trusted Devices</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remember devices for faster login
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={securitySettings.trustedDevices}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            trustedDevices: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushNotifications: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive notifications via text message
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Notification Types
                  </h4>

                  <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        Emergency Alerts
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Critical emergency notifications
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.emergencyAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emergencyAlerts: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        Network Updates
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Satellite network status and updates
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.networkUpdates}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            networkUpdates: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        Security Alerts
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Account security notifications
                      </p>
                    </div>
                    <div className="relative inline-flex cursor-pointer items-center">
                      <Switch
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            securityAlerts: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <h4 className="mb-4 font-medium text-slate-900 dark:text-white">
                    Quiet Hours
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Enable quiet hours
                      </span>
                      <div className="relative inline-flex cursor-pointer items-center">
                        <Switch
                          checked={notificationSettings.quietHours.enabled}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              quietHours: {
                                ...notificationSettings.quietHours,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    {notificationSettings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={notificationSettings.quietHours.start}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                quietHours: {
                                  ...notificationSettings.quietHours,
                                  start: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={notificationSettings.quietHours.end}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                quietHours: {
                                  ...notificationSettings.quietHours,
                                  end: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Devices */}
          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5" />
                  Connected Devices
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                    {devices.length} devices
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className={`rounded-xl border p-6 transition-all duration-300 ${
                        device.isCurrentDevice
                          ? "border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                          : "border-slate-200 bg-slate-100/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`rounded-xl p-3 ${
                              device.isCurrentDevice
                                ? "bg-green-500/20 text-green-400"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            }`}
                          >
                            {getDeviceIcon(device.type)}
                          </div>

                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {device.name}
                              </h3>
                              {device.isCurrentDevice && (
                                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                                  Current Device
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              <p>
                                {device.os} • {device.browser}
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {device.location}
                              </p>
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {device.lastActive}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center gap-4">
                              {device.batteryLevel && (
                                <div className="flex items-center gap-2">
                                  <Battery className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {device.batteryLevel}%
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {getSignalBars(device.signalStrength)}
                                </div>
                                <span
                                  className={`text-sm font-medium ${getSignalColor(device.signalStrength)}`}
                                >
                                  {device.signalStrength}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-full p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                            <DropdownMenuItem className="text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                              <Wifi className="mr-2 h-4 w-4" />
                              View Connection Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                              <Download className="mr-2 h-4 w-4" />
                              Download Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                            {!device.isCurrentDevice && (
                              <DropdownMenuItem
                                onClick={() => handleDeviceRemove(device.id)}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Remove Device
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6 bg-slate-200 dark:bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 font-medium text-slate-900 dark:text-white">
                      Device Management
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage your connected devices and security settings
                    </p>
                  </div>
                  <button className="flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-medium text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 hover:from-green-400 hover:to-emerald-400">
                    <Download className="h-4 w-4" />
                    Export Device List
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { ProfileSkeleton } from "./profile-skeleton";
