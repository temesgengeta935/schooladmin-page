// Initial mock data for all sections
export const initialData = {
  announcements: [
    {
      id: '1',
      title: 'School Reopening Announcement',
      content: 'All students are requested to return to school on Monday, September 1st. Please ensure you have completed all your holiday assignments.',
      category: 'Urgent',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Sports Day Celebration',
      content: 'Annual Sports Day will be held on January 25th. All students must participate in at least one event.',
      category: 'Event',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-12T09:15:00Z'
    },
    {
      id: '3',
      title: 'Parent-Teacher Meeting',
      content: 'Quarterly parent-teacher meeting scheduled for January 30th. Parents are requested to attend.',
      category: 'General',
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-01-05T11:00:00Z'
    }
  ],
  
  events: [
    {
      id: '1',
      title: 'Annual Science Fair',
      description: 'Showcase of student science projects with guest judges from local universities.',
      eventDate: '2024-02-15T09:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Cultural Festival',
      description: 'Annual cultural festival featuring dance, music, and drama performances.',
      eventDate: '2024-03-10T14:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w-400&h=300&fit=crop'
    }
  ],
  
  teachers: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      department: 'Mathematics',
      bio: 'PhD in Mathematics with 15 years of teaching experience. Specializes in Calculus and Algebra.',
      photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop'
    },
    {
      id: '2',
      name: 'Mr. David Chen',
      department: 'Science',
      bio: 'MSc in Physics. Passionate about making science fun and accessible to all students.',
      photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop'
    }
  ],
  
  departments: [
    {
      id: '1',
      name: 'Science Department',
      description: 'Focuses on Physics, Chemistry, Biology, and Environmental Science education.'
    },
    {
      id: '2',
      name: 'Mathematics Department',
      description: 'Dedicated to developing mathematical thinking and problem-solving skills.'
    },
    {
      id: '3',
      name: 'Humanities Department',
      description: 'Covers History, Geography, Languages, and Social Studies.'
    }
  ],
  
  gallery: [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
      caption: 'Annual Sports Day 2023'
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
      caption: 'Science Lab Session'
    }
  ],
  
  messages: [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Admission Inquiry',
      message: 'I would like to inquire about the admission process for grade 10.',
      createdAt: '2024-01-15T09:30:00Z'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      subject: 'Teacher Feedback',
      message: 'I wanted to provide feedback about my child\'s progress this semester.',
      createdAt: '2024-01-14T14:45:00Z'
    }
  ]
};

// Storage utility for local data persistence
export const storage = {
  get: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  set: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  clear: (key) => {
    localStorage.removeItem(key);
  }
};

// Initialize storage with mock data if empty
export const initializeStorage = () => {
  const keys = ['announcements', 'events', 'teachers', 'departments', 'gallery', 'messages'];
  
  keys.forEach(key => {
    if (!storage.get(key)) {
      storage.set(key, initialData[key]);
    }
  });
  
  // Initialize admin credentials
  if (!storage.get('admin')) {
    storage.set('admin', {
      email: 'admin@school.com',
      password: 'admin123'
    });
  }
};
     