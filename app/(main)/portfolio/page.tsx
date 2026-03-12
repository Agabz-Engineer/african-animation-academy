"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Eye,
  Clock
} from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  text: "#FAF3E1",
  muted: "#D2C9B8",
  line: "#444444",
  cardBg: "rgba(34, 34, 34, 0.60)",
  cardBorder: "rgba(68, 68, 68, 0.40)",
  hoverBg: "rgba(255,109,31,0.1)",
  overlayBg: "rgba(0,0,0,0.8)",
  filterBg: "rgba(34, 34, 34, 0.95)",
  filterBorder: "rgba(68, 68, 68, 0.6)",
};

const LIGHT_UI = {
  text: "#222222",
  muted: "#555555",
  line: "#E7DBBD",
  cardBg: "rgba(250, 243, 225, 0.80)",
  cardBorder: "rgba(231, 219, 189, 0.42)",
  hoverBg: "rgba(255,109,31,0.08)",
  overlayBg: "rgba(0,0,0,0.6)",
  filterBg: "rgba(250, 243, 225, 0.95)",
  filterBorder: "rgba(231, 219, 189, 0.6)",
};

// Animation portfolio data
const animationProjects = [
  {
    id: 1,
    title: "African Sunset Journey",
    category: "2D Animation",
    thumbnail: "/api/placeholder/400x300",
    duration: "2:30",
    views: 1234,
    likes: 89,
    comments: 12,
    description: "A vibrant 2D animation celebrating African landscapes and culture",
    tags: ["2D", "Cultural", "Landscape"],
    featured: true,
  },
  {
    id: 2,
    title: "Character Design: Adanna",
    category: "Character Design",
    thumbnail: "/api/placeholder/400x300",
    duration: "1:45",
    views: 892,
    likes: 67,
    comments: 8,
    description: "Original character design inspired by West African aesthetics",
    tags: ["Character", "Design", "Cultural"],
    featured: true,
  },
  {
    id: 3,
    title: "City Rhythm",
    category: "Motion Graphics",
    thumbnail: "/api/placeholder/400x300",
    duration: "0:30",
    views: 2341,
    likes: 156,
    comments: 23,
    description: "Dynamic motion graphics capturing the pulse of African city life",
    tags: ["Motion Graphics", "Urban", "Abstract"],
    featured: false,
  },
  {
    id: 4,
    title: "Wildlife Documentary Intro",
    category: "3D Animation",
    thumbnail: "/api/placeholder/400x300",
    duration: "1:15",
    views: 3456,
    likes: 234,
    comments: 45,
    description: "3D animated introduction for African wildlife documentary",
    tags: ["3D", "Wildlife", "Documentary"],
    featured: true,
  },
  {
    id: 5,
    title: "Traditional Patterns",
    category: "Motion Design",
    thumbnail: "/api/placeholder/400x300",
    duration: "0:45",
    views: 1567,
    likes: 98,
    comments: 15,
    description: "Animated traditional African patterns with modern twist",
    tags: ["Patterns", "Traditional", "Modern"],
    featured: false,
  },
  {
    id: 6,
    title: "Dance of the Spirits",
    category: "2D Animation",
    thumbnail: "/api/placeholder/400x300",
    duration: "3:20",
    views: 4567,
    likes: 312,
    comments: 67,
    description: "Spiritual dance animation inspired by African folklore",
    tags: ["2D", "Dance", "Folklore"],
    featured: true,
  },
];

const categories = ["All", "2D Animation", "3D Animation", "Character Design", "Motion Graphics", "Motion Design"];



export default function PortfolioPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredProjects = selectedCategory === "All" 
    ? animationProjects 
    : animationProjects.filter(project => project.category === selectedCategory);

  const featuredProjects = animationProjects.filter(project => project.featured);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9,
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div style={{ padding: "1.75rem 2rem", color: C.text, transition: "color 0.3s ease", width: "100%" }}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          marginBottom: "2rem"
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <h1 style={{ 
                fontFamily: "Clash Display, sans-serif", 
                fontSize: "2.5rem",
                fontWeight: 700,
                margin: "0 0 0.5rem 0",
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}>
                Animation Portfolio
              </h1>
              <p style={{ 
                color: C.muted, 
                margin: 0,
                fontFamily: "General Sans, sans-serif",
                fontSize: "1rem"
              }}>
                Showcase your creative journey through animation
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {/* View Mode Toggle */}
              <div style={{ 
                display: "flex", 
                border: `1px solid ${C.filterBorder}`,
                borderRadius: "8px",
                backgroundColor: C.filterBg,
                padding: "2px"
              }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    backgroundColor: viewMode === "grid" ? "#FF6D1F" : "transparent",
                    color: viewMode === "grid" ? "#222222" : C.text,
                    borderRadius: "6px 0 0 6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "General Sans, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <Grid3X3 size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    backgroundColor: viewMode === "list" ? "#FF6D1F" : "transparent",
                    color: viewMode === "list" ? "#222222" : C.text,
                    borderRadius: "0 6px 6px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "General Sans, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <List size={16} />
                  List
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                style={{
                  padding: "0.5rem 1rem",
                  border: `1px solid ${C.filterBorder}`,
                  backgroundColor: C.filterBg,
                  color: C.text,
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "General Sans, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <Filter size={16} />
                {selectedCategory}
              </button>
            </div>
          </div>
        </div>
      </motion.div>



      {/* Filter Dropdown */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "120px",
              right: "0",
              backgroundColor: C.filterBg,
              border: `1px solid ${C.filterBorder}`,
              borderRadius: "8px",
              padding: "0.5rem",
              zIndex: 50,
              minWidth: "200px",
            }}
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setFilterOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  backgroundColor: selectedCategory === category ? "#FF6D1F" : "transparent",
                  color: selectedCategory === category ? "#222222" : C.text,
                  borderRadius: "4px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "General Sans, sans-serif",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Section */}
      {selectedCategory === "All" && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ padding: "0 0 2rem" }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "Clash Display, sans-serif",
              fontSize: "1.875rem",
              fontWeight: 600,
              marginBottom: "2rem",
              color: C.text,
            }}>
              Featured Works
            </h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover="hover"
                  onHoverStart={() => setHoveredProject(project.id)}
                  onHoverEnd={() => setHoveredProject(null)}
                  style={{
                    position: "relative",
                    backgroundColor: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(255,109,31,0.1), rgba(224,77,0,0.1))`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Play size={48} style={{ color: "#FF6D1F" }} />
                    </div>
                    
                    {/* Hover Overlay */}
                    <AnimatePresence>
                      {hoveredProject === project.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: C.overlayBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1rem",
                          }}
                        >
                          <button style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}>
                            <Play size={16} />
                          </button>
                          <button style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}>
                            <Heart size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{
                      fontFamily: "Cabinet Grotesk, sans-serif",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      margin: "0 0 0.5rem 0",
                      color: C.text,
                    }}>
                      {project.title}
                    </h3>
                    
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}>
                      <span style={{
                        fontSize: "0.875rem",
                        color: C.muted,
                        fontFamily: "General Sans, sans-serif",
                      }}>
                        {project.category}
                      </span>
                      <span style={{
                        fontSize: "0.75rem",
                        color: C.muted,
                        fontFamily: "General Sans, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}>
                        <Clock size={12} />
                        {project.duration}
                      </span>
                    </div>

                    <p style={{
                      fontSize: "0.875rem",
                      color: C.muted,
                      margin: "0 0 1rem 0",
                      lineHeight: 1.5,
                      fontFamily: "Satoshi, sans-serif",
                    }}>
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap", 
                      gap: "0.5rem",
                      marginBottom: "1rem" 
                    }}>
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: C.hoverBg,
                            color: "#FF6D1F",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontFamily: "General Sans, sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center" 
                    }}>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontFamily: "General Sans, sans-serif",
                        }}>
                          <Eye size={12} />
                          {project.views.toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontFamily: "General Sans, sans-serif",
                        }}>
                          <Heart size={12} />
                          {project.likes}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontFamily: "General Sans, sans-serif",
                        }}>
                          <MessageCircle size={12} />
                          {project.comments}
                        </span>
                      </div>
                      
                      <button style={{
                        padding: "0.375rem 0.75rem",
                        backgroundColor: "#FF6D1F",
                        color: "#222222",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "General Sans, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}>
                        View
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* All Projects Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ padding: "0" }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "Clash Display, sans-serif",
            fontSize: "1.875rem",
            fontWeight: 600,
            marginBottom: "2rem",
            color: C.text,
          }}>
            {selectedCategory === "All" ? "All Projects" : selectedCategory}
          </h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
            }
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover="hover"
                layout
                style={
                  viewMode === "grid"
                    ? {
                        backgroundColor: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: "12px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }
                    : {
                        backgroundColor: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: "12px",
                        padding: "1rem",
                        display: "flex",
                        gap: "1rem",
                        cursor: "pointer",
                      }
                }
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Grid View */}
                    <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, rgba(255,109,31,0.1), rgba(224,77,0,0.1))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Play size={32} style={{ color: "#FF6D1F" }} />
                      </div>
                    </div>

                    <div style={{ padding: "1rem" }}>
                      <h3 style={{
                        fontFamily: "Cabinet Grotesk, sans-serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        margin: "0 0 0.5rem 0",
                        color: C.text,
                      }}>
                        {project.title}
                      </h3>
                      
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}>
                        <span style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          fontFamily: "General Sans, sans-serif",
                        }}>
                          {project.category}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: C.muted,
                          fontFamily: "General Sans, sans-serif",
                        }}>
                          {project.duration}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {project.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            style={{
                              padding: "0.125rem 0.375rem",
                              backgroundColor: C.hoverBg,
                              color: "#FF6D1F",
                              borderRadius: "3px",
                              fontSize: "0.625rem",
                              fontFamily: "General Sans, sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div style={{
                      position: "relative",
                      width: "200px",
                      height: "112px",
                      flexShrink: 0,
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, rgba(255,109,31,0.1), rgba(224,77,0,0.1))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Play size={24} style={{ color: "#FF6D1F" }} />
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: "Cabinet Grotesk, sans-serif",
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        margin: "0 0 0.5rem 0",
                        color: C.text,
                      }}>
                        {project.title}
                      </h3>
                      
                      <p style={{
                        fontSize: "0.875rem",
                        color: C.muted,
                        margin: "0 0 0.75rem 0",
                        lineHeight: 1.5,
                        fontFamily: "Satoshi, sans-serif",
                      }}>
                        {project.description}
                      </p>

                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem" 
                      }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            color: C.muted,
                            fontFamily: "General Sans, sans-serif",
                          }}>
                            {project.category}
                          </span>
                          <span style={{
                            fontSize: "0.75rem",
                            color: C.muted,
                            fontFamily: "General Sans, sans-serif",
                          }}>
                            {project.duration}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            color: C.muted,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontFamily: "General Sans, sans-serif",
                          }}>
                            <Eye size={12} />
                            {project.views}
                          </span>
                          <span style={{
                            fontSize: "0.75rem",
                            color: C.muted,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontFamily: "General Sans, sans-serif",
                          }}>
                            <Heart size={12} />
                            {project.likes}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {project.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: C.hoverBg,
                              color: "#FF6D1F",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontFamily: "General Sans, sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
