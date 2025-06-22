'use client';

import { useState, useEffect } from 'react';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaClock, FaFire, FaStar, FaPalette, FaGraduationCap, FaMedal } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Achievement {
  _id?: string;
  title: string;
  description: string;
  category: 'tenure' | 'visits' | 'clients' | 'consistency' | 'quality' | 'teamwork' | 'learning' | 'milestone';
  subcategory?: string;
  requirement: number;
  requirementType: 'count' | 'days' | 'streak' | 'percentage' | 'milestone';
  requirementDetails?: {
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
    consecutiveRequired?: boolean;
    minimumValue?: number;
    maximumValue?: number;
  };
  badge: string;
  color: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  reward?: {
    type: 'monetary' | 'time_off' | 'recognition' | 'privileges' | 'training';
    value: string;
    description: string;
  };
  prerequisites?: string[];
  isRepeatable: boolean;
  maxCompletions?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
}

const CATEGORY_OPTIONS = [
  { 
    value: 'tenure', 
    label: 'Tenure & Loyalty', 
    description: 'Time-based achievements for employee retention',
    icon: '🕒',
    color: 'bg-blue-500'
  },
  { 
    value: 'visits', 
    label: 'Performance', 
    description: 'Visit count and productivity achievements',
    icon: '📊',
    color: 'bg-green-500'
  },
  { 
    value: 'clients', 
    label: 'Client Relations', 
    description: 'Customer service and relationship building',
    icon: '👥',
    color: 'bg-purple-500'
  },
  { 
    value: 'consistency', 
    label: 'Consistency', 
    description: 'Regular work patterns and reliability',
    icon: '🔥',
    color: 'bg-orange-500'
  },
  { 
    value: 'quality', 
    label: 'Quality & Craft', 
    description: 'Service quality and skill mastery',
    icon: '⭐',
    color: 'bg-yellow-500'
  },
  { 
    value: 'learning', 
    label: 'Growth & Learning', 
    description: 'Skill development and education',
    icon: '📚',
    color: 'bg-indigo-500'
  },
  { 
    value: 'milestone', 
    label: 'Major Milestones', 
    description: 'Significant career achievements',
    icon: '🏆',
    color: 'bg-red-500'
  }
];

const TIER_OPTIONS = [
  { value: 'bronze', label: 'Bronze', color: 'bg-amber-600', textColor: 'text-amber-100' },
  { value: 'silver', label: 'Silver', color: 'bg-gray-400', textColor: 'text-gray-100' },
  { value: 'gold', label: 'Gold', color: 'bg-yellow-500', textColor: 'text-yellow-100' },
  { value: 'platinum', label: 'Platinum', color: 'bg-blue-400', textColor: 'text-blue-100' },
  { value: 'diamond', label: 'Diamond', color: 'bg-purple-600', textColor: 'text-purple-100' }
];

const REQUIREMENT_TYPE_OPTIONS = [
  { value: 'count', label: 'Count', description: 'Number of items (visits, clients, etc.)' },
  { value: 'days', label: 'Days', description: 'Number of days working' },
  { value: 'streak', label: 'Streak', description: 'Consecutive achievements' },
  { value: 'percentage', label: 'Percentage', description: 'Rate or efficiency metric' },
  { value: 'milestone', label: 'Milestone', description: 'Special achievement marker' }
];

const REWARD_TYPE_OPTIONS = [
  { value: 'monetary', label: 'Monetary', description: 'Cash bonus or payment' },
  { value: 'time_off', label: 'Time Off', description: 'Paid time off or vacation days' },
  { value: 'recognition', label: 'Recognition', description: 'Certificates, badges, or public recognition' },
  { value: 'privileges', label: 'Privileges', description: 'Special permissions or benefits' },
  { value: 'training', label: 'Training', description: 'Educational opportunities or courses' }
];

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'bg-green-500', label: 'Green', preview: 'bg-green-500' },
  { value: 'bg-yellow-500', label: 'Yellow', preview: 'bg-yellow-500' },
  { value: 'bg-red-500', label: 'Red', preview: 'bg-red-500' },
  { value: 'bg-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'bg-indigo-500', label: 'Indigo', preview: 'bg-indigo-500' },
  { value: 'bg-orange-500', label: 'Orange', preview: 'bg-orange-500' }
];

const EMOJI_OPTIONS = ['🎯', '📅', '🏆', '👑', '🥇', '💰', '⭐', '🔥', '💎', '👤', '👥', '👨‍👩‍👧‍👦', '🧲', '🎉', '🚀', '💪', '🌟', '⚡', '🎪', '🎨'];

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [formData, setFormData] = useState<Achievement>({
    title: '',
    description: '',
    category: 'tenure',
    subcategory: '',
    requirement: 1,
    requirementType: 'count',
    requirementDetails: {},
    badge: '🎯',
    color: 'bg-blue-500',
    icon: 'FaTrophy',
    tier: 'bronze',
    points: 10,
    reward: undefined,
    prerequisites: [],
    isRepeatable: false,
    maxCompletions: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/achievements');
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
      } else {
        toast.error('Failed to load achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Error loading achievements');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'tenure',
      subcategory: '',
      requirement: 1,
      requirementType: 'count',
      requirementDetails: {},
      badge: '🎯',
      color: 'bg-blue-500',
      icon: 'FaTrophy',
      tier: 'bronze',
      points: 10,
      reward: undefined,
      prerequisites: [],
      isRepeatable: false,
      maxCompletions: undefined,
      isActive: true
    });
    setEditingAchievement(null);
    setShowForm(false);
  };

  const handleEdit = (achievement: Achievement) => {
    setFormData(achievement);
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Title and description are required');
        return;
      }

      const url = editingAchievement 
        ? `/api/admin/achievements/${editingAchievement._id}`
        : '/api/admin/achievements';
      
      const method = editingAchievement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingAchievement ? 'Achievement updated successfully' : 'Achievement created successfully');
        fetchAchievements();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to save achievement');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast.error('Error saving achievement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/achievements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Achievement deleted successfully');
        fetchAchievements();
      } else {
        toast.error('Failed to delete achievement');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Error deleting achievement');
    }
  };

  const toggleActive = async (achievement: Achievement) => {
    try {
      const response = await fetch(`/api/admin/achievements/${achievement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...achievement,
          isActive: !achievement.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Achievement ${achievement.isActive ? 'disabled' : 'enabled'}`);
        fetchAchievements();
      } else {
        toast.error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Error updating achievement');
    }
  };

  const filteredAchievements = selectedCategory 
    ? achievements.filter(achievement => achievement.category === selectedCategory)
    : achievements;

  const getCategoryStats = () => {
    const stats = CATEGORY_OPTIONS.map(category => ({
      ...category,
      count: achievements.filter(a => a.category === category.value).length,
      active: achievements.filter(a => a.category === category.value && a.isActive).length
    }));
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaTrophy className="mr-3 text-yellow-500" />
              Advanced Achievement System
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage employee loyalty achievements to build a motivated team
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Achievement
          </button>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          {getCategoryStats().map((category) => (
            <div
              key={category.value}
              onClick={() => setSelectedCategory(selectedCategory === category.value ? '' : category.value)}
              className={`${category.color} rounded-lg p-4 text-white cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === category.value ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{category.label}</h3>
                <div className="text-xs opacity-90">
                  {category.active}/{category.count} active
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div key={achievement._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Achievement Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{achievement.badge}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        TIER_OPTIONS.find(t => t.value === achievement.tier)?.color
                      } ${TIER_OPTIONS.find(t => t.value === achievement.tier)?.textColor}`}>
                        {achievement.tier.toUpperCase()}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => toggleActive(achievement)}
                    className={achievement.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}
                  >
                    {achievement.isActive ? <FaEye /> : <FaTimes />}
                  </button>
                  <button
                    onClick={() => handleDelete(achievement._id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Achievement Details */}
              <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">
                    {CATEGORY_OPTIONS.find(c => c.value === achievement.category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requirement:</span>
                  <span className="font-medium">
                    {achievement.requirement} {achievement.requirementType}
                    {achievement.requirementDetails?.timeframe && ` (${achievement.requirementDetails.timeframe})`}
                  </span>
                </div>
                {achievement.reward && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reward:</span>
                    <span className="font-medium text-green-600">
                      {achievement.reward.value}
                    </span>
                  </div>
                )}
                {achievement.isRepeatable && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Repeatable:</span>
                    <span className="font-medium text-blue-600">
                      {achievement.maxCompletions ? `Up to ${achievement.maxCompletions}x` : 'Unlimited'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Achievement title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="What does this achievement recognize?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory || ''}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., onboarding, milestone, etc."
                      />
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirement Type
                      </label>
                      <select
                        value={formData.requirementType}
                        onChange={(e) => setFormData({ ...formData, requirementType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {REQUIREMENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} - {option.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirement Value
                      </label>
                      <input
                        type="number"
                        value={formData.requirement}
                        onChange={(e) => setFormData({ ...formData, requirement: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tier
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TIER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Customization */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Emoji
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, badge: emoji })}
                          className={`p-2 text-lg border rounded hover:bg-gray-50 ${
                            formData.badge === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`h-8 w-8 rounded border-2 ${color.preview} ${
                            formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isRepeatable}
                          onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm">Repeatable Achievement</span>
                      </label>
                      {formData.isRepeatable && (
                        <input
                          type="number"
                          value={formData.maxCompletions || ''}
                          onChange={(e) => setFormData({ ...formData, maxCompletions: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="Max completions (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Reward Configuration */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={formData.reward?.type || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({
                            ...formData,
                            reward: {
                              type: e.target.value as any,
                              value: formData.reward?.value || '',
                              description: formData.reward?.description || ''
                            }
                          });
                        } else {
                          setFormData({ ...formData, reward: undefined });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No reward</option>
                      {REWARD_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formData.reward && (
                      <>
                        <input
                          type="text"
                          value={formData.reward.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            reward: { ...formData.reward!, value: e.target.value }
                          })}
                          placeholder="Reward value (e.g., $50, 1 day)"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={formData.reward.description}
                          onChange={(e) => setFormData({
                            ...formData,
                            reward: { ...formData.reward!, description: e.target.value }
                          })}
                          placeholder="Reward description"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {editingAchievement ? 'Update Achievement' : 'Create Achievement'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 