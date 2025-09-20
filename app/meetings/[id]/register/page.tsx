"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Meeting, Event, AgeGroup } from '@/types';
import { format } from 'date-fns';
import { Calendar, MapPin, AlertCircle, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp, CreditCard, KeyRound as Pound } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useCart, CartItem } from '@/components/ui/cart';

interface EventEntry {
  id: string;
  ageGroupId: string;
  eventId: string;
  personalBest: string;
  pbVenue: string;
  pbDate: string;
}

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [eventEntries, setEventEntries] = useState<EventEntry[]>([]);
  const [collapsedEntries, setCollapsedEntries] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (!loading && (!user || user.userType !== 'athlete')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingResponse, eventsResponse, ageGroupsResponse] = await Promise.all([
          apiClient.getMeeting(meetingId),
          apiClient.getEvents(),
          apiClient.getAgeGroups()
        ]);

        if (meetingResponse.success && eventsResponse.success && ageGroupsResponse.success) {
          const fetchedMeeting = meetingResponse.data;
          if (fetchedMeeting && fetchedMeeting.id) {
            setMeeting({
              id: fetchedMeeting.id,
              name: fetchedMeeting.name || '',
              venue: fetchedMeeting.venue || '',
              description: fetchedMeeting.description || '',
              isOpen: fetchedMeeting.isOpen || false,
              date: new Date(fetchedMeeting.date),
              closingDate: new Date(fetchedMeeting.closingDate)
            });
          }
          setEvents(eventsResponse.data);
          setAgeGroups(ageGroupsResponse.data);

          // Add initial entry with first age group pre-selected
          if (ageGroupsResponse.data.length > 0) {
            addEventEntry(ageGroupsResponse.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load meeting information');
      } finally {
        setLoadingData(false);
      }
    };

    if (meetingId && user) {
      fetchData();
    }
  }, [meetingId, user]);

  const addEventEntry = (defaultAgeGroupId?: string) => {
    const newEntry: EventEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ageGroupId: defaultAgeGroupId || (ageGroups.length > 0 ? ageGroups[0].id : ''),
      eventId: '',
      personalBest: '',
      pbVenue: '',
      pbDate: ''
    };
    setEventEntries(prev => [...prev, newEntry]);
  };

  const removeEventEntry = (id: string) => {
    setEventEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const calculateTotalCost = () => {
    return eventEntries.length * 10; // £10 per event
  };

  const updateEventEntry = (id: string, field: keyof EventEntry, value: string) => {
    setEventEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const toggleCollapse = (entryId: string) => {
    setCollapsedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const getEventTitle = (entry: EventEntry, index: number) => {
    const selectedEvent = events.find(e => e.id === entry.eventId);
    const selectedAgeGroup = ageGroups.find(ag => ag.id === entry.ageGroupId);
    
    if (selectedEvent && selectedAgeGroup) {
      return `${selectedAgeGroup.name} - ${selectedEvent.name}`;
    } else if (selectedEvent) {
      return `Event ${index + 1} - ${selectedEvent.name}`;
    } else if (selectedAgeGroup) {
      return `Event ${index + 1} - ${selectedAgeGroup.name}`;
    }
    return `Event ${index + 1}`;
  };

  const handleAddToCart = async () => {
    if (!user || !meeting) return;

    // Validate entries
    const incompleteEntries = eventEntries.filter(entry => 
      !entry.eventId || !entry.ageGroupId || !entry.personalBest
    );
    
    if (incompleteEntries.length > 0) {
      setError('Please complete all required fields (Age Group, Event, and Personal Best)');
      return;
    }

    if (eventEntries.length === 0) {
      setError('Please add at least one event');
      return;
    }

    if (eventEntries.length > 5) {
      setError('Maximum 5 events allowed');
      return;
    }

    // Create cart item
    const cartItem: CartItem = {
      id: `${meeting.id}-${Date.now()}`,
      meetingId: meeting.id,
      meetingName: meeting.name,
      eventCount: eventEntries.length,
      totalCost: calculateTotalCost(),
      events: eventEntries.map(entry => {
        const event = events.find(e => e.id === entry.eventId);
        const ageGroup = ageGroups.find(ag => ag.id === entry.ageGroupId);
        return {
          eventName: event?.name || 'Unknown Event',
          ageGroupName: ageGroup?.name || 'Unknown Age Group',
          cost: 10
        };
      })
    };

    // Add to cart
    addToCart(cartItem);
    
    // Show success message and redirect
    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !meeting) {
    return null;
  }

  const isExpired = new Date() > meeting.closingDate;
  const hasOnlyOneAgeGroup = ageGroups.length === 1;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Added to Cart!</h2>
              <p className="text-gray-600 mb-4">
                {eventEntries.length} events have been added to your cart for {meeting.name}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in 2 seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back to Meetings
          </Button>
        </div>

        <div className="space-y-6">
          {/* Meeting Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {meeting.name}
                <Badge variant={meeting.isOpen && !isExpired ? "default" : "secondary"}>
                  {isExpired ? 'Closed' : meeting.isOpen ? 'Open' : 'Upcoming'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {format(meeting.date, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {meeting.venue}
              </div>
              <div className="text-sm">
                <strong>Closing Date:</strong> {format(meeting.closingDate, 'MMM d, yyyy')}
              </div>
            </CardContent>
          </Card>

          {isExpired ? (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Registration for this meeting has closed.</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Event Registration Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Registration</CardTitle>
                  <p className="text-sm text-gray-600">
                    Add up to 5 events you wish to participate in. Personal Best is required for seeding purposes.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    Events: {eventEntries.length}/5
                  </div>
                  
                  {/* Cost Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">
                        Registration Cost:
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-blue-700">
                          {eventEntries.length} events × £10 each
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          £{calculateTotalCost()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Entries */}
                  <div className="space-y-4">
                    {eventEntries.map((entry, index) => (
                      <Collapsible
                        key={entry.id}
                        open={!collapsedEntries.has(entry.id)}
                        onOpenChange={() => toggleCollapse(entry.id)}
                      >
                        <div className="border rounded-lg bg-white">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {getEventTitle(entry, index)}
                                </h4>
                                {entry.personalBest && (
                                  <span className="text-sm text-gray-500">
                                    (PB: {entry.personalBest})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {eventEntries.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeEventEntry(entry.id);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {collapsedEntries.has(entry.id) ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Age Group */}
                                <div className="space-y-2">
                                  <Label>Age Group *</Label>
                                  <Select
                                    value={entry.ageGroupId}
                                    onValueChange={(value) => updateEventEntry(entry.id, 'ageGroupId', value)}
                                    disabled={hasOnlyOneAgeGroup}
                                  >
                                    <SelectTrigger className={hasOnlyOneAgeGroup ? 'bg-gray-100' : ''}>
                                      <SelectValue placeholder="Select age group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ageGroups.map(group => (
                                        <SelectItem key={group.id} value={group.id}>
                                          {group.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Event */}
                                <div className="space-y-2">
                                  <Label>Event *</Label>
                                  <Select
                                    value={entry.eventId}
                                    onValueChange={(value) => updateEventEntry(entry.id, 'eventId', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {events.map(event => (
                                        <SelectItem key={event.id} value={event.id}>
                                          {event.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Personal Best */}
                                <div className="space-y-2">
                                  <Label>Personal Best *</Label>
                                  <Input
                                    placeholder="e.g. 10.50"
                                    value={entry.personalBest}
                                    onChange={(e) => updateEventEntry(entry.id, 'personalBest', e.target.value)}
                                  />
                                </div>

                                {/* PB Venue */}
                                <div className="space-y-2">
                                  <Label>PB Venue</Label>
                                  <Input
                                    placeholder="e.g. Crystal Palace"
                                    value={entry.pbVenue}
                                    onChange={(e) => updateEventEntry(entry.id, 'pbVenue', e.target.value)}
                                  />
                                </div>

                                {/* PB Date */}
                                <div className="space-y-2">
                                  <Label>PB Date</Label>
                                  <Input
                                    type="date"
                                    value={entry.pbDate}
                                    onChange={(e) => updateEventEntry(entry.id, 'pbDate', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>

                  {/* Add Event Button */}
                  {eventEntries.length < 5 && (
                    <Button
                      variant="outline"
                      onClick={() => addEventEntry()}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Event
                    </Button>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-red-500 hover:bg-red-600"
                      disabled={submitting || eventEntries.length === 0}
                    >
                      {submitting ? 'Adding to Cart...' : `Add to Cart - £${calculateTotalCost()}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}