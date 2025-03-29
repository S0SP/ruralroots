"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ArrowLeft, Download, Calendar, Tractor, Leaf, Droplet, Sprout } from "lucide-react"

// Types
type SchemeCategory = "subsidy" | "loan" | "insurance" | "training" | "all"
type SchemeIcon = "tractor" | "leaf" | "droplet" | "sprout" | "calendar"

interface Scheme {
  id: string
  title: string
  description: string
  category: Exclude<SchemeCategory, "all">
  eligibility: string[]
  benefits: string
  lastDate: string
  fundingAmount: string
  icon: SchemeIcon
}

// Mock government schemes data
const mockSchemes: Scheme[] = [
  {
    id: "pm-kisan",
    title: "PM-KISAN Scheme",
    description: "Direct income support of ₹6,000 per year to farmer families across the country.",
    category: "subsidy",
    eligibility: [
      "Small and marginal farmers with landholding up to 2 hectares",
      "All farmer families across the country",
      "Subject to exclusion criteria",
    ],
    benefits: "₹6,000 per year in three equal installments of ₹2,000 each",
    lastDate: "Ongoing scheme with quarterly payments",
    fundingAmount: "₹6,000 per year",
    icon: "tractor",
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Comprehensive crop insurance scheme to protect farmers from crop losses due to natural calamities.",
    category: "insurance",
    eligibility: [
      "All farmers growing notified crops in notified areas",
      "Both loanee and non-loanee farmers",
      "Sharecroppers and tenant farmers",
    ],
    benefits: "Insurance coverage and financial support to farmers in case of crop failure",
    lastDate: "Varies by crop season - Kharif: July 31, Rabi: December 31",
    fundingAmount: "Premium subsidy shared by Central and State Governments",
    icon: "leaf",
  },
  {
    id: "soil-health-card",
    title: "Soil Health Card Scheme",
    description:
      "Provides information on soil health and recommends appropriate dosage of nutrients for improving soil health and fertility.",
    category: "subsidy",
    eligibility: ["All farmers across the country", "Priority to small and marginal farmers"],
    benefits: "Free soil testing and recommendations for improving soil health",
    lastDate: "Ongoing scheme",
    fundingAmount: "Free service",
    icon: "sprout",
  },
  {
    id: "pmksy",
    title: "Pradhan Mantri Krishi Sinchayee Yojana",
    description: "Ensures access to means of irrigation to all agricultural farms to produce 'per drop more crop'.",
    category: "subsidy",
    eligibility: [
      "Farmers with agricultural land",
      "Priority to small and marginal farmers",
      "Focus on water-stressed areas",
    ],
    benefits: "Subsidy for micro-irrigation systems and water conservation infrastructure",
    lastDate: "Applications accepted year-round",
    fundingAmount: "Up to 55% subsidy on micro-irrigation equipment",
    icon: "droplet",
  },
  {
    id: "kcc",
    title: "Kisan Credit Card",
    description: "Provides farmers with affordable credit for their agricultural needs.",
    category: "loan",
    eligibility: [
      "All farmers, tenant farmers, sharecroppers, and oral lessees",
      "Self-help groups of farmers",
      "Joint liability groups of farmers",
    ],
    benefits: "Short-term loans at reduced interest rates with flexible repayment options",
    lastDate: "Applications accepted year-round",
    fundingAmount: "Credit limit based on land holding and crops grown",
    icon: "calendar",
  },
  {
    id: "agri-infra-fund",
    title: "Agriculture Infrastructure Fund",
    description:
      "Financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.",
    category: "loan",
    eligibility: [
      "Farmers, FPOs, PACS, Marketing Cooperative Societies",
      "Self Help Groups, Joint Liability Groups",
      "Multipurpose Cooperative Societies, Agri-entrepreneurs, Start-ups",
    ],
    benefits: "Long-term debt financing with interest subvention of 3% per annum",
    lastDate: "Applications accepted until 2029",
    fundingAmount: "Loans up to ₹2 crore with interest subsidy",
    icon: "tractor",
  },
  {
    id: "atma",
    title: "Agricultural Technology Management Agency (ATMA)",
    description: "Provides training and extension services to farmers for better crop management and productivity.",
    category: "training",
    eligibility: [
      "All farmers interested in training and extension services",
      "Priority to small and marginal farmers",
      "Women farmers",
    ],
    benefits: "Free training, demonstrations, and exposure visits",
    lastDate: "Programs conducted throughout the year",
    fundingAmount: "Free service with allowances for training programs",
    icon: "leaf",
  },
  {
    id: "pkvy",
    title: "Paramparagat Krishi Vikas Yojana",
    description: "Promotes organic farming practices and certification to improve soil health and reduce input costs.",
    category: "subsidy",
    eligibility: [
      "Farmers willing to adopt organic farming",
      "Groups of farmers with contiguous land",
      "Priority to areas with low chemical input usage",
    ],
    benefits: "Financial assistance for organic inputs, certification, and marketing",
    lastDate: "Applications accepted year-round",
    fundingAmount: "₹50,000 per hectare for three years",
    icon: "sprout",
  },
]

// Icon component
interface SchemeIconProps {
  icon: SchemeIcon
}

const SchemeIcon: React.FC<SchemeIconProps> = ({ icon }) => {
  switch (icon) {
    case "tractor":
      return <Tractor style={{ height: "24px", width: "24px", color: "#2e7d32" }} />
    case "leaf":
      return <Leaf style={{ height: "24px", width: "24px", color: "#2e7d32" }} />
    case "droplet":
      return <Droplet style={{ height: "24px", width: "24px", color: "#2e7d32" }} />
    case "sprout":
      return <Sprout style={{ height: "24px", width: "24px", color: "#2e7d32" }} />
    case "calendar":
      return <Calendar style={{ height: "24px", width: "24px", color: "#2e7d32" }} />
  }
}

// Category badge component
interface CategoryBadgeProps {
  category: Exclude<SchemeCategory, "all">
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getColorStyle = (): React.CSSProperties => {
    switch (category) {
      case "subsidy":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534",
        }
      case "loan":
        return {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
        }
      case "insurance":
        return {
          backgroundColor: "#f3e8ff",
          color: "#7e22ce",
        }
      case "training":
        return {
          backgroundColor: "#ffedd5",
          color: "#9a3412",
        }
    }
  }

  return (
    <span
      style={{
        ...getColorStyle(),
        fontWeight: "500",
        textTransform: "capitalize",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
      }}
    >
      {category}
    </span>
  )
}

const SchemesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<SchemeCategory>("all")
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>(mockSchemes)

  // Filter schemes based on search query and active category
  useEffect(() => {
    let result = mockSchemes

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((scheme) => scheme.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(query) ||
          scheme.description.toLowerCase().includes(query) ||
          scheme.eligibility.some((item) => item.toLowerCase().includes(query)),
      )
    }

    setFilteredSchemes(result)
  }, [searchQuery, activeCategory])

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" ,  marginTop:'35px' }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginRight: "16px",
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
          
          </button>
        </a>
        <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#2e7d32" , paddingLeft:'26.5%' }}>Government Schemes for Farmers</h1>
      </div>

      {/* Search and filter */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          <div style={{ position: "relative", flex: "1 1 0%" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              placeholder="          Search schemes by name, description, or eligibility..."
              style={{
                paddingLeft: "40px",
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeCategory === "all" ? "#e5e7eb" : "white",
                  fontWeight: activeCategory === "all" ? "500" : "normal",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeCategory === "subsidy" ? "#e5e7eb" : "white",
                  fontWeight: activeCategory === "subsidy" ? "500" : "normal",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory("subsidy")}
              >
                Subsidies
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeCategory === "loan" ? "#e5e7eb" : "white",
                  fontWeight: activeCategory === "loan" ? "500" : "normal",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory("loan")}
              >
                Loans
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeCategory === "insurance" ? "#e5e7eb" : "white",
                  fontWeight: activeCategory === "insurance" ? "500" : "normal",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory("insurance")}
              >
                Insurance
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeCategory === "training" ? "#e5e7eb" : "white",
                  fontWeight: activeCategory === "training" ? "500" : "normal",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setActiveCategory("training")}
              >
                Training
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: "#6b7280" }}>
          Showing {filteredSchemes.length} of {mockSchemes.length} schemes
        </p>
      </div>

      {/* Schemes grid */}
      {filteredSchemes.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        marginRight: "12px",
                        backgroundColor: "#f0f9f0",
                        padding: "8px",
                        borderRadius: "9999px",
                      }}
                    >
                      <SchemeIcon icon={scheme.icon} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "500" }}>{scheme.title}</h3>
                      <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>{scheme.fundingAmount}</p>
                    </div>
                  </div>
                  <CategoryBadge category={scheme.category} />
                </div>
              </div>
              <div style={{ padding: "16px", flex: "1 1 0%" }}>
                <p style={{ color: "#4b5563", marginBottom: "16px" }}>{scheme.description}</p>
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ fontWeight: "500", color: "#111827", marginBottom: "8px" }}>Eligibility:</h4>
                  <ul
                    style={{
                      listStyleType: "disc",
                      paddingLeft: "20px",
                      fontSize: "14px",
                      color: "#4b5563",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {scheme.eligibility.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: "500", color: "#111827", marginBottom: "8px" }}>Last Date:</h4>
                  <p style={{ fontSize: "14px", color: "#4b5563" }}>{scheme.lastDate}</p>
                </div>
              </div>
              <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button
                  style={{
                    width: "100%",
                    backgroundColor: "#2e7d32",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ height: "16px", width: "16px", marginRight: "8px" }} />
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
            No schemes found
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "16px" }}>Try adjusting your search or filter criteria</p>
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onClick={() => {
              setSearchQuery("")
              setActiveCategory("all")
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Farmer assistance */}
      <div style={{ marginTop: "48px", backgroundColor: "#f0f9f0", padding: "24px", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32", marginBottom: "16px" }}>
          Need Help Applying?
        </h2>
        <p style={{ color: "#374151", marginBottom: "16px" }}>
          Our local agriculture extension officers can help you understand eligibility requirements and complete your
          application.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button
            style={{
              backgroundColor: "#fb8c00",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Call Helpline: 1800-180-1551
          </button>
          <button
            style={{
              border: "1px solid #2e7d32",
              color: "#2e7d32",
              padding: "8px 16px",
              backgroundColor: "transparent",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Schedule In-Person Assistance
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchemesPage

