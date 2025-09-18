import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Database, Settings, Upload, Download, Wifi, WifiOff } from 'lucide-react';
import { Course, User, SyncStatus } from '../types';
import { db } from '../lib/database';
import { auth } from '../lib/auth';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    last_sync: 'Never',
    status: 'idle',
    pending_changes: 0,
    conflicts: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const user = auth.getCurrentUser();

  useEffect(() => {
    loadData();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    try {
      const coursesData = await db.getCourses();
      setCourses(coursesData);
      // In a real app, you'd load all users from admin endpoint
      
      // Get offline queue status
      const queueItems = await db.getOfflineQueue();
      setSyncStatus(prev => ({
        ...prev,
        pending_changes: queueItems.length
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
    
    try {
      // Trigger offline queue sync
      const queueItems = await db.getOfflineQueue();
      console.log('Starting sync of', queueItems.length, 'items');
      
      // Process each queue item
      for (const item of queueItems) {
        try {
          await db.markQueueItemSynced(item._id);
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sync time
      
      setSyncStatus({
        last_sync: new Date().toISOString(),
        status: 'idle',
        pending_changes: 0,
        conflicts: 0
      });
      
      console.log('Sync completed successfully');
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
      console.error('Sync failed:', error);
    }
  };

  const handleImportChannel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Importing channel:', file.name);
        // In a real app, this would parse the zip and import content
        alert('Channel import functionality would be implemented here');
      }
    };
    input.click();
  };

  const handleExportChannel = (course: Course) => {
    // In a real app, this would create and download a zip file
    console.log('Exporting channel:', course.title);
    alert(`Exporting "${course.title}" channel...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">System administration and monitoring</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                  <p className="text-sm text-blue-800">Courses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{users.length}</p>
                  <p className="text-sm text-green-800">Users</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{syncStatus.pending_changes}</p>
                  <p className="text-sm text-purple-800">Pending Sync</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                {!isOnline ? (
                  <WifiOff className="w-8 h-8 text-orange-600 mr-3" />
                ) : syncStatus.status === 'syncing' ? (
                  <Wifi className="w-8 h-8 text-orange-600 mr-3 animate-pulse" />
                ) : (
                  <Wifi className="w-8 h-8 text-green-600 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-orange-800 capitalize">
                    {!isOnline ? 'Offline' : syncStatus.status}
                  </p>
                  <p className="text-xs text-orange-600">
                    {!isOnline ? 'No connection' : syncStatus.last_sync === 'Never' ? 'Never synced' : 'Connected'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncStatus.status === 'syncing' || !isOnline}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isOnline ? 'Offline' : syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Management</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleImportChannel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Upload size={18} />
              <span>Import Channel</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <Settings size={18} />
              <span>System Settings</span>
            </button>
          </div>

          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleExportChannel(course)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Download size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No courses available. Import a channel to get started.</p>
          )}
        </div>

        {/* Device Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connected Devices</h2>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Device monitoring would be implemented here</p>
            <p className="text-sm text-gray-500">Show connected devices, bandwidth usage, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}