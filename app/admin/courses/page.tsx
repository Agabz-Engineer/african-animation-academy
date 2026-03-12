"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Clock,
  Star,
  DollarSign,
  MoreVertical,
  Play,
  FileText,
  Image,
  Video,
  Download,
  Upload
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { publishCourse, draftCourse, archiveCourse, deleteCourse } from "@/app/admin/actions";

const DARK_UI = {
  bg: "#0F0F0F",
  card: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const LIGHT_UI = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  textMuted: "#6B7280",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  lessons: number;
  price: string;
  rating: number;
  enrolled_count: number;
  thumbnail_url: string | null;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function CourseManagement() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleCourseAction = async (action: string, courseId: string) => {
    try {
      let result;
      switch (action) {
        case 'publish':
          result = await publishCourse(courseId);
          break;
        case 'draft':
          result = await draftCourse(courseId);
          break;
        case 'archive':
          result = await archiveCourse(courseId);
          break;
        case 'delete':
          result = await deleteCourse(courseId);
          break;
      }
      
      await fetchCourses();
    } catch (error) {
      console.error('Error performing course action:', error);
      alert('Failed to perform course action. Please check console for details.');
    }
  };

  const handleSaveCourse = async (courseData: Partial<Course>) => {
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      
      if (isEditing && selectedCourse) {
        await supabase
          .from('courses')
          .update(courseData)
          .eq('id', selectedCourse.id);
      } else {
        await supabase
          .from('courses')
          .insert([courseData]);
      }
      
      await fetchCourses();
      setShowCourseModal(false);
      setSelectedCourse(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: UI.success,
      draft: UI.warning,
      archived: UI.textMuted,
    };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: `${colors[status as keyof typeof colors]}20`,
        color: colors[status as keyof typeof colors],
      }}>
        {status === 'published' && <Play style={{ width: '12px', height: '12px' }} />}
        {status === 'draft' && <FileText style={{ width: '12px', height: '12px' }} />}
        {status === 'archived' && <Clock style={{ width: '12px', height: '12px' }} />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      Beginner: UI.success,
      Intermediate: UI.warning,
      Advanced: UI.danger,
    };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: `${colors[level as keyof typeof colors]}20`,
        color: colors[level as keyof typeof colors],
      }}>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: `3px solid ${UI.border}`, 
          borderTopColor: UI.accent, 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ 
            color: UI.text, 
            fontSize: "2rem", 
            fontWeight: 700, 
            margin: "0 0 0.5rem 0" 
          }}>
            Course Management
          </h1>
          <p style={{ 
            color: UI.textMuted, 
            fontSize: "1rem", 
            margin: 0 
          }}>
            Create, edit, and manage all animation courses
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCourse(null);
            setIsEditing(false);
            setShowCourseModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: UI.success,
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "2rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: UI.bg,
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: `1px solid ${UI.border}`,
          flex: 1,
          minWidth: "300px",
        }}>
          <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
          <input
            type="text"
            placeholder="Search courses by title, instructor, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: UI.text,
              fontSize: "0.875rem",
              flex: 1,
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
        
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: `1px solid ${UI.border}`,
            backgroundColor: UI.bg,
            color: UI.text,
            fontSize: "0.875rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: `1px solid ${UI.border}`,
            backgroundColor: UI.bg,
            color: UI.text,
            fontSize: "0.875rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.info, marginBottom: "0.5rem" }}>
            {courses.length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Total Courses</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.success, marginBottom: "0.5rem" }}>
            {courses.filter(c => c.status === 'published').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Published</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.warning, marginBottom: "0.5rem" }}>
            {courses.filter(c => c.status === 'draft').length}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Drafts</div>
        </div>
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: UI.accent, marginBottom: "0.5rem" }}>
            {courses.reduce((sum, c) => sum + c.enrolled_count, 0)}
          </div>
          <div style={{ color: UI.textMuted, fontSize: "0.875rem" }}>Total Enrollments</div>
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            style={{
              backgroundColor: UI.card,
              border: `1px solid ${UI.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            {/* Course Thumbnail */}
            <div style={{
              height: "200px",
              backgroundColor: UI.bg,
              backgroundImage: course.thumbnail_url ? `url(${course.thumbnail_url})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}>
              {!course.thumbnail_url && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: UI.textMuted,
                }}>
                  <BookOpen style={{ width: "48px", height: "48px" }} />
                </div>
              )}
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                display: "flex",
                gap: "0.5rem",
              }}>
                {getStatusBadge(course.status)}
                {getLevelBadge(course.level)}
              </div>
            </div>

            {/* Course Content */}
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ 
                color: UI.text, 
                fontSize: "1.125rem", 
                fontWeight: 600, 
                margin: "0 0 0.5rem 0" 
              }}>
                {course.title}
              </h3>
              
              <p style={{ 
                color: UI.textMuted, 
                fontSize: "0.875rem", 
                margin: "0 0 1rem 0",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {course.description}
              </p>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem", 
                marginBottom: "1rem",
                fontSize: "0.875rem",
                color: UI.textMuted,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Users style={{ width: "14px", height: "14px" }} />
                  {course.instructor}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock style={{ width: "14px", height: "14px" }} />
                  {course.duration}
                </div>
              </div>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Star style={{ width: "16px", height: "16px", color: UI.warning, fill: UI.warning }} />
                  <span style={{ color: UI.text, fontSize: "0.875rem", fontWeight: 500 }}>
                    {course.rating}
                  </span>
                </div>
                <div style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 700, 
                  color: UI.accent 
                }}>
                  {course.price}
                </div>
              </div>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                fontSize: "0.875rem",
                color: UI.textMuted,
                marginBottom: "1rem",
              }}>
                <span>{course.lessons} lessons</span>
                <span>{course.enrolled_count} enrolled</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsEditing(true);
                    setShowCourseModal(true);
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    backgroundColor: UI.info,
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <Edit style={{ width: "14px", height: "14px" }} />
                  Edit
                </button>
                
                {course.status === 'draft' ? (
                  <button
                    onClick={() => handleCourseAction('publish', course.id)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      backgroundColor: UI.success,
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Play style={{ width: "14px", height: "14px" }} />
                  </button>
                ) : course.status === 'published' ? (
                  <button
                    onClick={() => handleCourseAction('archive', course.id)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      backgroundColor: UI.warning,
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Clock style={{ width: "14px", height: "14px" }} />
                  </button>
                ) : null}
                
                <button
                  onClick={() => handleCourseAction('delete', course.id)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "6px",
                    backgroundColor: UI.danger,
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "2rem",
        }}>
          <div style={{
            backgroundColor: UI.card,
            border: `1px solid ${UI.border}`,
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h2 style={{ 
              color: UI.text, 
              fontSize: "1.5rem", 
              fontWeight: 700, 
              margin: "0 0 1.5rem 0" 
            }}>
              {isEditing ? 'Edit Course' : 'Add New Course'}
            </h2>
            
            <CourseForm
              course={selectedCourse}
              onSave={handleSaveCourse}
              onCancel={() => {
                setShowCourseModal(false);
                setSelectedCourse(null);
                setIsEditing(false);
              }}
              UI={UI}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Course Form Component
function CourseForm({ 
  course, 
  onSave, 
  onCancel, 
  UI 
}: { 
  course: Course | null;
  onSave: (data: Partial<Course>) => void;
  onCancel: () => void;
  UI: any;
}) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    level: course?.level || 'Beginner',
    duration: course?.duration || '',
    lessons: course?.lessons || 0,
    price: course?.price || '',
    rating: course?.rating || 0,
    thumbnail_url: course?.thumbnail_url || '',
    status: course?.status || 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ 
            display: "block", 
            color: UI.text, 
            fontSize: "0.875rem", 
            fontWeight: 500, 
            marginBottom: "0.5rem" 
          }}>
            Course Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: `1px solid ${UI.border}`,
              backgroundColor: UI.bg,
              color: UI.text,
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            color: UI.text, 
            fontSize: "0.875rem", 
            fontWeight: 500, 
            marginBottom: "0.5rem" 
          }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: `1px solid ${UI.border}`,
              backgroundColor: UI.bg,
              color: UI.text,
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Instructor
            </label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 4h 30m"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Lessons
            </label>
            <input
              type="number"
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: parseInt(e.target.value) })}
              required
              min="1"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Price
            </label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., GH₵50"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              color: UI.text, 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              marginBottom: "0.5rem" 
            }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.bg,
                color: UI.text,
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ 
            display: "block", 
            color: UI.text, 
            fontSize: "0.875rem", 
            fontWeight: 500, 
            marginBottom: "0.5rem" 
          }}>
            Thumbnail URL
          </label>
          <input
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            placeholder="https://example.com/thumbnail.jpg"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: `1px solid ${UI.border}`,
              backgroundColor: UI.bg,
              color: UI.text,
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginTop: "2rem", 
        justifyContent: "flex-end" 
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: "transparent",
            color: UI.textMuted,
            border: `1px solid ${UI.border}`,
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: UI.success,
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {course ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
