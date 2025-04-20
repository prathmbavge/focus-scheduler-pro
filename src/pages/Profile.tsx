import { type FC, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Calendar, BookOpen, Clock, MapPin, Edit, Save } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from 'sonner';
import { fetchProfile, updateProfile, type Profile as ProfileType } from '@/services/profileService';
import { useUser } from '@/context/UserContext';

const Profile: FC = () => {
  const { user, loading, error, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileType | null>(null);

  // Replace the manual fetch with context data
  useEffect(() => {
    if (user) {
      setEditedData(user);
    }
  }, [user]);

  const handleEditToggle = async () => {
    if (isEditing && editedData) {
      try {
        await updateUser(editedData);
        setIsEditing(false);
      } catch (err) {
        toast.error('Failed to update profile');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (loading) {
    return <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </main>
    </div>;
  }

  if (error || !user) {
    return <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            {error || 'Failed to load profile'}
          </div>
        </div>
      </main>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-muted-foreground">View and edit your profile information</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="glass-card p-6 rounded-xl lg:col-span-1 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              <CustomButton
                onClick={handleEditToggle}
                className="flex items-center gap-2 mt-2"
              >
                {isEditing ? (
                  <>
                    <Save size={16} />
                    <span>Save Profile</span>
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </>
                )}
              </CustomButton>
            </div>
            
            {/* Profile Details Card */}
            <div className="glass-card p-6 rounded-xl lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={editedData.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={editedData.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium mb-1">University</label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      value={editedData.university}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={editedData.location}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={editedData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span>{user.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span>{user.joinDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">University</span>
                      <span>{user.university}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Study Time</span>
                      <span>{user.studyHours}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span>{user.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Study Statistics Card */}
            <div className="glass-card p-6 rounded-xl lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Study Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-medium">Completed Tasks</h3>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-medium">Study Hours</h3>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-medium">Productivity Score</h3>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
