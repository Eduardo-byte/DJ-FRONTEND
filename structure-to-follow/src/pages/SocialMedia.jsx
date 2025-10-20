import { useState, useEffect, useContext } from 'react';
import { UserDataContext } from '../context/UserDataContext';
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Card,
  CardBody,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem,
  DatePicker,
} from "@heroui/react";
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Image as ImageIcon,
  Send,
  Eye,
  Share2,
  MoreVertical,
  Heart,
  MessageCircle,
  Repeat2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { today, getLocalTimeZone } from "@internationalized/date";

// Social Media Platform Configuration
const PLATFORMS = {
  meta: {
    name: 'Meta (FB + IG)',
    icon: Facebook,
    secondaryIcon: Instagram,
    color: '#1877F2',
    isMulti: true
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2'
  }
};

const POST_STATUSES = {
  draft: { label: 'Draft', color: 'default' },
  scheduled: { label: 'Scheduled', color: 'warning' },
  published: { label: 'Published', color: 'success' },
  failed: { label: 'Failed', color: 'danger' },
};

export default function SocialMedia() {
  const { userData } = useContext(UserDataContext);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    content: '',
    platform: '',
    imageUrl: '',
    scheduledDate: null,
    status: 'draft'
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulate loading posts - October 2025 dates
    const mockPosts = [
      {
        id: '1',
        content: 'Exciting news! Our new AI assistant is now available. Try it today and transform your business! 🚀',
        platform: 'facebook',
        imageUrl: '/Olivia-ai-LOGO.png',
        status: 'published',
        scheduledDate: new Date('2025-10-01T10:00:00'),
        publishedDate: new Date('2025-10-01T10:00:00'),
        engagement: { likes: 245, comments: 32, shares: 18 }
      },
      {
        id: '2',
        content: 'Tips for improving customer engagement with AI chatbots 💡\n\n1. Personalize responses\n2. Quick response time\n3. 24/7 availability',
        platform: 'instagram',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-05T15:30:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '3',
        content: 'Happy Monday! Starting the week with productivity tips 💼',
        platform: 'linkedin',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-06T09:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '4',
        content: '🎉 Big announcement! Our platform now integrates with all major social networks. Connect with your audience everywhere! #SocialMedia #Marketing',
        platform: 'meta',
        imageUrl: '/Olivia-ai-LOGO.png',
        status: 'scheduled',
        scheduledDate: new Date('2025-10-06T14:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '5',
        content: 'Join us for our webinar this Thursday! Learn how to leverage AI for your business growth 📈',
        platform: 'twitter',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-09T11:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '6',
        content: 'Customer success story: How Company X increased conversions by 40% using our AI platform! 🚀',
        platform: 'linkedin',
        imageUrl: '/Olivia-ai-LOGO.png',
        status: 'scheduled',
        scheduledDate: new Date('2025-10-10T14:30:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '7',
        content: 'Weekend motivation! Keep pushing towards your goals 💪 #MondayMotivation',
        platform: 'facebook',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-13T08:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '8',
        content: 'Behind the scenes: Our team working on exciting new features! Stay tuned 👀',
        platform: 'instagram',
        imageUrl: '/Olivia-ai-LOGO.png',
        status: 'scheduled',
        scheduledDate: new Date('2025-10-15T16:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '9',
        content: 'Flash Sale Alert! 🎁 50% off on all premium plans this week only. Don\'t miss out!',
        platform: 'meta',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-15T18:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '10',
        content: 'Thank you for 10K followers! 🎉 We couldn\'t have done it without you. Here\'s to the next milestone!',
        platform: 'twitter',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-20T12:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '11',
        content: 'Industry insights: The future of AI in customer service. Read our latest blog post! 📖',
        platform: 'linkedin',
        imageUrl: '/Olivia-ai-LOGO.png',
        status: 'scheduled',
        scheduledDate: new Date('2025-10-22T10:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '12',
        content: 'Happy Friday! What are your weekend plans? Share with us below! 😊',
        platform: 'facebook',
        imageUrl: null,
        status: 'scheduled',
        scheduledDate: new Date('2025-10-24T17:00:00'),
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
      {
        id: '13',
        content: 'Working on an exciting new feature. Stay tuned! #AI #Innovation',
        platform: 'twitter',
        imageUrl: null,
        status: 'draft',
        scheduledDate: null,
        engagement: { likes: 0, comments: 0, shares: 0 }
      },
    ];
    setPosts(mockPosts);
  }, []);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform;
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.scheduledDate || b.publishedDate) - new Date(a.scheduledDate || a.publishedDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.scheduledDate || a.publishedDate) - new Date(b.scheduledDate || b.publishedDate);
      }
      return 0;
    });

  // Handlers
  const handleCreatePost = (date = null) => {
    setFormData({
      content: '',
      platform: '',
      imageUrl: '',
      scheduledDate: date,
      status: 'draft'
    });
    setSelectedDate(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setFormData({
      content: post.content,
      platform: post.platform,
      imageUrl: post.imageUrl || '',
      scheduledDate: post.scheduledDate,
      status: post.status
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setPosts(posts.filter(p => p.id !== selectedPost.id));
    setIsDeleteModalOpen(false);
    toast.success('Post deleted successfully');
  };

  const handleSavePost = () => {
    if (!formData.content || !formData.platform) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditModalOpen) {
      // Update existing post
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, ...formData }
          : p
      ));
      toast.success('Post updated successfully');
    } else {
      // Create new post
      const newPost = {
        id: Date.now().toString(),
        ...formData,
        engagement: { likes: 0, comments: 0, shares: 0 }
      };
      setPosts([newPost, ...posts]);
      toast.success('Post created successfully');
    }

    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleSchedulePost = () => {
    if (!formData.scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }
    
    const updatedFormData = { ...formData, status: 'scheduled' };
    setFormData(updatedFormData);
    
    if (isEditModalOpen) {
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, ...updatedFormData }
          : p
      ));
      toast.success('Post scheduled successfully');
    } else {
      const newPost = {
        id: Date.now().toString(),
        ...updatedFormData,
        engagement: { likes: 0, comments: 0, shares: 0 }
      };
      setPosts([newPost, ...posts]);
      toast.success('Post scheduled successfully');
    }
    
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPostsForDate = (date) => {
    return posts.filter(post => {
      if (!post.scheduledDate && !post.publishedDate) return false;
      const postDate = new Date(post.scheduledDate || post.publishedDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    handleCreatePost(date);
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Post Card Component
  const PostCard = ({ post }) => {
    const platformConfig = PLATFORMS[post.platform] || { icon: Share2, color: '#666', name: 'Unknown' };
    const PlatformIcon = platformConfig.icon;
    const SecondaryIcon = platformConfig.secondaryIcon;
    const platformColor = platformConfig.color;
    const statusConfig = POST_STATUSES[post.status];

    return (
      <Card
        shadow="none"
        className="border border-gray-100 hover:border-brand transition-all duration-250"
      >
        <CardBody className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="relative p-1.5 rounded-lg" style={{ backgroundColor: `${platformColor}15` }}>
                <PlatformIcon className="w-3 h-3" style={{ color: platformColor }} />
                {platformConfig.isMulti && SecondaryIcon && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                    <SecondaryIcon className="w-2 h-2" style={{ color: '#E4405F' }} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {platformConfig.name}
                </p>
              </div>
            </div>
            <Chip
              size="sm"
              color={statusConfig.color}
              variant="flat"
              className="h-5 text-[10px]"
            >
              {statusConfig.label}
            </Chip>
          </div>

          {/* Image Preview */}
          {post.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.imageUrl}
                alt="Post preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {post.content}
          </p>

          {/* Engagement Metrics (for published posts) */}
          {post.status === 'published' && (
            <div className="flex items-center gap-3 py-1.5 border-t border-gray-100 mb-2">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span className="text-[10px] text-gray-500">{post.engagement.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] text-gray-500">{post.engagement.comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3 text-green-500" />
                <span className="text-[10px] text-gray-500">{post.engagement.shares}</span>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
            <Clock className="w-3 h-3" />
            {formatDate(post.publishedDate || post.scheduledDate)}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-gray-100">
            <Tooltip content="View">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="min-w-6 w-6 h-6"
              >
                <Eye className="w-3 h-3 text-gray-600" />
              </Button>
            </Tooltip>
            <Tooltip content="Edit">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="min-w-6 w-6 h-6"
                onPress={() => handleEditPost(post)}
              >
                <Edit3 className="w-3 h-3 text-gray-600" />
              </Button>
            </Tooltip>
            <Tooltip content="Delete">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="min-w-6 w-6 h-6"
                onPress={() => handleDeletePost(post)}
              >
                <Trash2 className="w-3 h-3 text-danger" />
              </Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
    );
  };

  // Calendar View Component
  const CalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create array of all days to display (including previous month's days)
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }

    return (
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => changeMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => changeMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const postsForDay = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date() && !isToday;

            return (
              <div
                key={date.toISOString()}
                className={`
                  relative aspect-square border rounded-lg p-2 cursor-pointer transition-all
                  ${isToday ? 'bg-brand/10 border-brand' : 'border-gray-200 hover:border-brand'}
                  ${isPast ? 'bg-gray-50' : 'bg-white'}
                `}
                onClick={() => handleDateClick(date)}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                  {date.getDate()}
                </div>

                {/* Posts for this day */}
                <div className="space-y-1">
                  {postsForDay.slice(0, 3).map(post => {
                    const platformConfig = PLATFORMS[post.platform] || {};
                    const PlatformIcon = platformConfig.icon || Share2;
                    const SecondaryIcon = platformConfig.secondaryIcon;
                    
                    return (
                      <div
                        key={post.id}
                        className={`
                          flex items-center gap-1 px-2 py-1.5 rounded text-[10px] cursor-pointer
                          transition-transform duration-200 hover:scale-[1.02]
                          ${post.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                            post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
                            'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post);
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <PlatformIcon className="w-3 h-3" />
                          {platformConfig.isMulti && SecondaryIcon && (
                            <SecondaryIcon className="w-2 h-2 absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <span className="truncate flex-1">
                          {post.scheduledDate ? (() => {
                            const date = new Date(post.scheduledDate);
                            const hours = date.getHours();
                            const minutes = date.getMinutes();
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                          })() : 'No time'}
                        </span>
                      </div>
                    );
                  })}
                  {postsForDay.length > 3 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{postsForDay.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add button on hover */}
                {postsForDay.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Post Form Modal Component
  const PostFormModal = ({ isOpen, onClose, title }) => {
    const SelectedPlatformIcon = formData.platform && PLATFORMS[formData.platform] 
      ? PLATFORMS[formData.platform].icon 
      : Share2;

    // Check if this is a published post being edited
    const isPublished = selectedPost?.status === 'published';
    const isEditingPublished = isEditModalOpen && isPublished;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            {isEditingPublished && (
              <p className="text-sm text-gray-500 font-normal">
                This post has already been published and cannot be rescheduled.
              </p>
            )}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Platform Selection */}
              <Select
                label="Platform"
                placeholder="Select a platform"
                value={formData.platform}
                selectedKeys={formData.platform ? [formData.platform] : []}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                startContent={<SelectedPlatformIcon className="w-4 h-4" />}
                isDisabled={isEditingPublished}
              >
              {Object.entries(PLATFORMS).map(([key, platform]) => (
                <SelectItem
                  key={key}
                  value={key}
                  startContent={<platform.icon className="w-4 h-4" style={{ color: platform.color }} />}
                >
                  {platform.name}
                </SelectItem>
              ))}
            </Select>

            {/* Content */}
            <Textarea
              label="Post Content"
              placeholder="What would you like to share?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              minRows={5}
              maxRows={10}
              isDisabled={isEditingPublished}
            />

            {/* Image URL */}
            <Input
              label="Image URL (optional)"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              startContent={<ImageIcon className="w-4 h-4 text-gray-400" />}
              isDisabled={isEditingPublished}
            />

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    toast.error('Failed to load image');
                  }}
                />
              </div>
            )}

            {/* Scheduled Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {isEditingPublished ? 'Published Date & Time' : 'Schedule Date & Time (optional)'}
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledDate ? (() => {
                  const date = new Date(formData.scheduledDate);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })() : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  scheduledDate: e.target.value ? new Date(e.target.value) : null 
                })}
                startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                isDisabled={isEditingPublished}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
          >
            {isEditingPublished ? 'Close' : 'Cancel'}
          </Button>
          {!isEditingPublished && (
            <>
              <Button
                className="bg-gray-100 text-gray-700"
                onPress={handleSavePost}
              >
                Save as Draft
              </Button>
              <Button
                className="bg-brand text-gray-900"
                onPress={handleSchedulePost}
                startContent={<Send className="w-4 h-4" />}
              >
                {formData.scheduledDate ? 'Schedule Post' : 'Publish Now'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Share2 className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Social Media Posts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create, schedule, and manage your social media content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
              onPress={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className={viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}
              onPress={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            className="bg-brand text-gray-900 font-medium"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => handleCreatePost(null)}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* Filters - Only show in grid view */}
      {viewMode === 'grid' && (
        <div className="rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            size="sm"
            isClearable
            onClear={() => setSearchQuery("")}
            classNames={{
              inputWrapper: "border-gray-200",
            }}
          />
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                className="min-w-[140px] bg-gray-50 text-gray-600"
                startContent={<Filter className="w-4 h-4" />}
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                {selectedPlatform === 'all' ? 'All Platforms' : PLATFORMS[selectedPlatform]?.name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={new Set([selectedPlatform])}
              onSelectionChange={(keys) => setSelectedPlatform(Array.from(keys)[0])}
            >
              <DropdownItem key="all">All Platforms</DropdownItem>
              {Object.entries(PLATFORMS).map(([key, platform]) => (
                <DropdownItem
                  key={key}
                  startContent={<platform.icon className="w-4 h-4" style={{ color: platform.color }} />}
                >
                  {platform.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                className="min-w-[140px] bg-gray-50 text-gray-600"
                startContent={<Filter className="w-4 h-4" />}
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                {selectedStatus === 'all' ? 'All Status' : POST_STATUSES[selectedStatus]?.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={new Set([selectedStatus])}
              onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0])}
            >
              <DropdownItem key="all">All Status</DropdownItem>
              {Object.entries(POST_STATUSES).map(([key, status]) => (
                <DropdownItem key={key}>{status.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                className="min-w-[140px] bg-gray-50 text-gray-600"
                startContent={<Filter className="w-4 h-4" />}
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={new Set([sortBy])}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
            >
              <DropdownItem key="newest">Newest First</DropdownItem>
              <DropdownItem key="oldest">Oldest First</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Total Posts</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">{posts.length}</h3>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Published</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">
            {posts.filter(p => p.status === 'published').length}
          </h3>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Scheduled</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">
            {posts.filter(p => p.status === 'scheduled').length}
          </h3>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Drafts</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">
            {posts.filter(p => p.status === 'draft').length}
          </h3>
        </div>
      </div>

      {/* Calendar or Grid View */}
      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <div className="rounded-lg">
          {filteredPosts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-lg p-12 text-center">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || selectedPlatform !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first social media post to get started'}
            </p>
            <Button
              className="bg-brand text-gray-900"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleCreatePost}
            >
              Create Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PostFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Post"
      />

      <PostFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Post"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

