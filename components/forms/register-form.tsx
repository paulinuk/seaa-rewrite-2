"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Club {
  id: string;
  club_id: number;
  name: string;
  is_active: boolean;
  is_county: boolean;
  password?: string;
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    clubId: '',
    clubRole: '',
    telephone: '',
    mobile: '',
    clubColours: ''
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        console.log('🚀 RegisterForm: Fetching clubs from API...');
        setLoadingClubs(true);
        
        const response = await fetch('/api/clubs');
        const result = await response.json();
        
        if (result.success) {
          console.log('🎯 RegisterForm: Received clubs:', result.data.length);
          console.log('🎯 RegisterForm: Club names:', result.data.map((c: Club) => c.name).slice(0, 5));
          setClubs(result.data);
        } else {
          console.error('❌ RegisterForm: API error:', result.error);
          setClubs([]);
        }
      } catch (error) {
        console.error('💥 RegisterForm: Network error:', error);
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.firstName || !formData.surname || !formData.email || !formData.password || !formData.userType) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result === 'email_confirmation') {
      setSuccess('Registration successful! Please check your email and click the confirmation link to complete your account setup.');
      setError('');
    } else if (result === 'success') {
      router.push('/dashboard');
    } else {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Register for Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Registration Type *</Label>
            <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="athlete">Athlete</SelectItem>
                <SelectItem value="team_manager">Team Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Select 
                value={formData.clubId} 
                onValueChange={(value) => handleInputChange('clubId', value)}
                disabled={loadingClubs}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClubs ? "Loading clubs..." : "Select your club"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{club.name}</span>
                        {club.is_county && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            County
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                {loadingClubs ? 'Loading clubs...' : `${clubs.length} clubs available${clubs.length === 0 ? ' - Check console for debug info' : ''}`}
              </div>
            </div>
            
            {formData.userType === 'team_manager' && (
              <div className="space-y-2">
                <Label htmlFor="clubRole">Club Role</Label>
                <Input
                  id="clubRole"
                  value={formData.clubRole}
                  onChange={(e) => handleInputChange('clubRole', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
              />
            </div>
          </div>

          {formData.userType === 'team_manager' && (
            <div className="space-y-2">
              <Label htmlFor="clubColours">Club Colours</Label>
              <Input
                id="clubColours"
                value={formData.clubColours}
                onChange={(e) => handleInputChange('clubColours', e.target.value)}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}