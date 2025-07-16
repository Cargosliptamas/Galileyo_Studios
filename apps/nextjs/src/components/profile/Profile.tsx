'use client';

import React, { useState } from 'react';
import { 
  Shield, Radio, Bell, Globe, Camera, Trash2, Save, X, Phone,
  UserRoundIcon,
  User,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { Input } from '@galileyo/ui/input';
import { Label } from '@galileyo/ui/label';
import { Textarea } from '@galileyo/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const trpc = useTRPC();
  const { data:currentUser } = useSuspenseQuery(trpc.profile.getProfile.queryOptions());
  // Form states
  const [formData, setFormData] = useState({
    name: currentUser.full_name,
    email: currentUser.email,
    phone: currentUser.phone ?? '',
    location: '',
    language: 'English',
    website: '',
    bio: currentUser.about || '',
    photo: currentUser.photo || '',
    timezone: 'America/New_York',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    twoFactorEnabled: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the changes to your backend
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <User className="h-5 w-5" /> },
    { id: 'security', name: 'Security', icon: <Shield className="h-5 w-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'devices', name: 'Connected Devices', icon: <Radio className="h-5 w-5" /> },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className='UserRoundIcon h-24 w-24'>
              <AvatarImage src={currentUser.photo} alt={currentUser.full_name} />
              <AvatarFallback>
                <UserRoundIcon size={16} className="opacity-60" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Profile Picture</h3>
            <p className="text-sm text-gray-400">PNG, JPG or GIF, max 2MB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
        <h3 className="text-lg font-medium text-white mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary">Update Password</button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.twoFactorEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        {formData.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-blue-500" />
                <span>Authenticator app configured</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors text-sm">
              Reconfigure 2FA settings
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Active Sessions</h3>
            <p className="text-sm text-gray-400">Manage your active sessions across devices</p>
          </div>
          <button className="text-red-400 hover:text-red-300 transition-colors">
            Sign out all devices
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Chrome on MacBook Pro</div>
                <div className="text-sm text-gray-400">New York, USA • Current session</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">iPhone 13 Pro</div>
                <div className="text-sm text-gray-400">Los Angeles, USA • 2 days ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
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
        <h3 className="text-lg font-medium text-white mb-6">Notification Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-400">Receive real-time alerts on your devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-400">Receive alerts via text message</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.smsNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-6">Alert Types</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-500 bg-white/5 border-white/10 rounded focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="text-white font-medium">Emergency Alerts</label>
              <p className="text-sm text-gray-400">Critical updates and emergency notifications</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-500 bg-white/5 border-white/10 rounded focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="text-white font-medium">Weather Updates</label>
              <p className="text-sm text-gray-400">Severe weather warnings and forecasts</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-500 bg-white/5 border-white/10 rounded focus:ring-blue-500"
            />
            <div className="ml-4">
              <label className="text-white font-medium">System Updates</label>
              <p className="text-sm text-gray-400">Maintenance and system status notifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeviceSettings = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">Connected Devices</h3>
            <p className="text-sm text-gray-400">Manage your connected SATCOM devices</p>
          </div>
          <button 
            onClick={() => router.push('/profile/connect-device')}
            className="btn-primary"
          >
            Add Device
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Radio className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Satellite Phone</div>
                <div className="text-sm text-gray-400">Model: ST-165 • Battery: 85%</div>
                <div className="text-xs text-green-400 mt-1">Connected • Last active: 2h ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Emergency Beacon</div>
                <div className="text-sm text-gray-400">Model: EB-200 • Battery: 92%</div>
                <div className="text-xs text-gray-400 mt-1">Last active: 5d ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-6">Device Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Emergency Contact</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number or email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location Sharing</label>
            <select
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="glass-card">
          <div className="border-b border-white/10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 hover:text-white transition-colors"
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
              <div className="flex items-center gap-4 mt-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
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
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'devices' && renderDeviceSettings()}
          </div>

          {activeTab === 'general' && (
            <div className="p-6 border-t border-white/10">
              <div className="glass-card p-6 bg-red-500/10">
                <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
                <p className="text-gray-300 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Account</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete your account? All of your data will be permanently removed.
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}