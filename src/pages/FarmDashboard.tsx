import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Droplet, Thermometer, Leaf, FlaskRoundIcon as Flask, Sun, Cloud, CloudRain, CheckCircle, Circle, AlertTriangle, CheckCircle2, XCircle, Download, Calendar, Tractor, Sprout } from 'lucide-react';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Types
type Crop = "Wheat" | "Tomato" | "Rice";
type ValidationStatus = "pending" | "success" | "retry" | "failed";
type SensorType = "ph" | "moisture" | "nitrogen" | "phosphorus" | "potassium" | "temperature" | "humidity";
type WeatherCondition = "sunny" | "cloudy" | "rainy";

type SensorData = {
  ph: number[];
  moisture: number[];
  humidity: number[];
  npk: {
    nitrogen: number[];
    phosphorus: number[];
    potassium: number[];
  };
  temperature: number[];
  dates: string[];
};

type TodoItem = {
  id: string;
  action: string;
  expectedDays: number;
  addedDate: Date;
  completed: boolean;
  completedDate?: Date;
  validationStatus: ValidationStatus;
  validationMessage?: string;
  sensorType: SensorType;
};

type WeatherForecast = {
  date: string;
  condition: WeatherCondition;
  temperature: number;
};

// Mock data generator
const generateMockData = (): SensorData => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  return {
    ph: Array.from({ length: 7 }, () => +(5 + Math.random() * 3).toFixed(1)),
    moisture: Array.from({ length: 7 }, () => +(20 + Math.random() * 60).toFixed(1)),
    humidity: Array.from({ length: 7 }, () => +(40 + Math.random() * 40).toFixed(1)),
    npk: {
      nitrogen: Array.from({ length: 7 }, () => +(30 + Math.random() * 70).toFixed(1)),
      phosphorus: Array.from({ length: 7 }, () => +(20 + Math.random() * 60).toFixed(1)),
      potassium: Array.from({ length: 7 }, () => +(40 + Math.random() * 50).toFixed(1)),
    },
    temperature: Array.from({ length: 7 }, () => +(15 + Math.random() * 15).toFixed(1)),
    dates,
  };
};

// Generate weather forecast
const generateWeatherForecast = (): WeatherForecast[] => {
  const conditions: WeatherCondition[] = ["sunny", "cloudy", "rainy"];
  const today = new Date();

  return Array.from({ length: 3 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: +(15 + Math.random() * 15).toFixed(1),
    };
  });
};

// Generate AI recommendations based on sensor data
const generateRecommendations = (sensorData: SensorData, crop: Crop): string[] => {
  const recommendations: string[] = [];
  const currentPh = sensorData.ph[sensorData.ph.length - 1];
  const currentMoisture = sensorData.moisture[sensorData.moisture.length - 1];
  const currentHumidity = sensorData.humidity[sensorData.humidity.length - 1];
  const currentNitrogen = sensorData.npk.nitrogen[sensorData.npk.nitrogen.length - 1];
  const currentPhosphorus = sensorData.npk.phosphorus[sensorData.npk.phosphorus.length - 1];
  const currentPotassium = sensorData.npk.potassium[sensorData.npk.potassium.length - 1];

  if (currentPh < 6) {
    recommendations.push("Add 5kg lime per acre to increase soil pH");
  } else if (currentPh > 7.5) {
    recommendations.push("Add sulfur to decrease soil pH");
  }

  if (currentMoisture < 30) {
    recommendations.push("Increase irrigation frequency to improve soil moisture");
  } else if (currentMoisture > 70) {
    recommendations.push("Reduce irrigation to prevent waterlogging");
  }

  if (currentHumidity < 50) {
    recommendations.push("Consider using mulch to increase ambient humidity");
  } else if (currentHumidity > 80) {
    recommendations.push("Improve ventilation to reduce excessive humidity");
  }

  if (currentNitrogen < 50) {
    recommendations.push("Apply urea fertilizer to boost nitrogen levels");
  }

  if (currentPhosphorus < 40) {
    recommendations.push("Add phosphate fertilizer to improve phosphorus content");
  }

  if (currentPotassium < 50) {
    recommendations.push("Apply potash to increase potassium levels");
  }

  // Crop-specific recommendations
  switch (crop) {
    case "Wheat":
      recommendations.push("Maintain soil moisture between 40-60% for optimal wheat growth");
      break;
    case "Tomato":
      recommendations.push("Ensure pH stays between 6.0-6.8 for best tomato yield");
      break;
    case "Rice":
      recommendations.push("Keep soil moisture above 60% for rice cultivation");
      break;
  }

  return recommendations;
};

// Generate alternative crop suggestion
const getAlternativeCrop = (currentCrop: Crop, sensorData: SensorData): { crop: Crop; yieldIncrease: number } => {
  const alternatives: { [key in Crop]: Crop[] } = {
    Wheat: ["Rice", "Tomato"],
    Rice: ["Wheat", "Tomato"],
    Tomato: ["Wheat", "Rice"],
  };

  const alternativeCrop = alternatives[currentCrop][
    Math.floor(Math.random() * alternatives[currentCrop].length)
  ] as Crop;
  const yieldIncrease = +(5 + Math.random() * 20).toFixed(0);

  return { crop: alternativeCrop, yieldIncrease };
};

// Get recommended planting date
const getRecommendedPlantingDate = (): string => {
  const today = new Date();
  const daysToAdd = Math.floor(Math.random() * 14) + 1;
  const plantingDate = new Date(today);
  plantingDate.setDate(plantingDate.getDate() + daysToAdd);

  return plantingDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
    point: {
      radius: 2,
      hoverRadius: 4,
    },
  },
};

// Weather icon component
interface WeatherIconProps {
  condition: WeatherCondition;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ condition }) => {
  switch (condition) {
    case "sunny":
      return <Sun style={{ height: '24px', width: '24px', color: '#f59e0b' }} />;
    case "cloudy":
      return <Cloud style={{ height: '24px', width: '24px', color: '#6b7280' }} />;
    case "rainy":
      return <CloudRain style={{ height: '24px', width: '24px', color: '#3b82f6' }} />;
  }
};

// Progress component
interface ProgressProps {
  value: number;
  style?: React.CSSProperties;
}

const Progress: React.FC<ProgressProps> = ({ value, style }) => (
  <div
    style={{
      position: 'relative',
      height: '16px',
      width: '100%',
      overflow: 'hidden',
      borderRadius: '9999px',
      backgroundColor: '#e5e7eb',
      ...style
    }}
  >
    <div
      style={{
        height: '100%',
        width: '100%',
        flex: '1 1 0%',
        backgroundColor: '#2e7d32',
        transition: 'all 0.2s',
        transform: `translateX(-${100 - (value || 0)}%)`
      }}
    />
  </div>
);

// TodoList component
interface TodoListProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
  completionPercentage: number;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggleTodo, onRemoveTodo, completionPercentage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const todoListRef = useRef<HTMLDivElement>(null);

  // Check if all todos are completed and validated successfully
  const allCompletedAndValidated =
    todos.length > 0 && todos.every((todo) => todo.completed && todo.validationStatus === "success");

  // Trigger celebration when all todos are completed and validated
  useEffect(() => {
    if (allCompletedAndValidated && !isCelebrating && !showSuccessMessage) {
      setIsCelebrating(true);

      // After a short delay, show success message and hide todo list
      setTimeout(() => {
        setShowSuccessMessage(true);

        // After showing success message, reset celebration state after 5 seconds
        setTimeout(() => {
          setIsCelebrating(false);
          setShowSuccessMessage(false);
        }, 5000);
      }, 1000);
    }
  }, [allCompletedAndValidated, isCelebrating, showSuccessMessage]);

  // Calculate days remaining for each todo
  const calculateDaysRemaining = (todo: TodoItem): number => {
    if (todo.completed && todo.completedDate) {
      const daysSinceCompletion = Math.floor(
        (new Date().getTime() - todo.completedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = todo.expectedDays - daysSinceCompletion;
      return Math.max(0, daysRemaining);
    } else {
      return todo.expectedDays;
    }
  };

  // Get status icon based on validation status
  const getStatusIcon = (status: ValidationStatus): React.ReactNode => {
    switch (status) {
      case "success":
        return <CheckCircle style={{ height: '20px', width: '20px', color: '#16a34a' }} />;
      case "retry":
        return <AlertTriangle style={{ height: '20px', width: '20px', color: '#f59e0b' }} />;
      case "failed":
        return <XCircle style={{ height: '20px', width: '20px', color: '#ef4444' }} />;
      case "pending":
      default:
        return (
          <div style={{ position: 'relative' }}>
            <Circle style={{ height: '20px', width: '20px', color: '#f59e0b' }} />
            {!isCollapsed && (
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                height: '8px',
                width: '8px',
                backgroundColor: '#f59e0b',
                borderRadius: '9999px',
                animation: 'pulse 2s infinite'
              }}></span>
            )}
          </div>
        );
    }
  };

  // If celebrating, render the celebration animation
  if (isCelebrating) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '128px'
      }}>
        <div style={{
          animation: 'bounce 1s infinite',
          backgroundColor: '#2e7d32',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          🎉 Yay! Successfully completed all AI recommendations! 🎉
        </div>
      </div>
    );
  }

  // If showing success message, render it
  if (showSuccessMessage) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 10,
        backgroundColor: '#2e7d32',
        color: 'white',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>
          🌱 All recommendations successfully implemented! Your farm is now optimized. 🌱
        </p>
      </div>
    );
  }

  return (
    <div
      ref={todoListRef}
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: 10,
        transition: 'all 0.3s',
        height: isCollapsed ? '48px' : 'auto',
        maxHeight: isCollapsed ? '48px' : '384px'
      }}
    >
      <div
        style={{
          backgroundColor: '#f3f4f6',
          borderTop: '1px solid #e5e7eb',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
          📋 Your Action Plan (AI-Verified)
          <span style={{
            marginLeft: '8px',
            fontSize: '14px',
            backgroundColor: '#2e7d32',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '9999px'
          }}>
            {todos.filter((t) => t.completed && t.validationStatus === "success").length}/{todos.length}
          </span>
        </h3>
        <span>{isCollapsed ? "▲" : "▼"}</span>
      </div>

      {!isCollapsed && (
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          overflowY: 'auto',
          maxHeight: 'calc(100% - 48px)',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Progress</span>
              <span style={{ fontSize: '14px' }}>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} style={{ height: '8px' }} />
          </div>

          {todos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280' }}>
              No actions to track. Follow AI recommendations to add them here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    borderLeft: '4px solid',
                    borderLeftColor: todo.validationStatus === "success"
                      ? '#2e7d32'
                      : todo.validationStatus === "failed"
                        ? '#ef4444'
                        : todo.completed
                          ? '#fb8c00'
                          : '#d1d5db'
                  }}
                >
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: '1 1 0%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <button
                            style={{
                              padding: '0',
                              height: '24px',
                              marginRight: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            onClick={() => onToggleTodo(todo.id)}
                          >
                            {todo.completed ? (
                              todo.validationStatus === "success" ? (
                                <CheckCircle2 style={{ height: '20px', width: '20px', color: '#2e7d32' }} />
                              ) : todo.validationStatus === "failed" ? (
                                <XCircle style={{ height: '20px', width: '20px', color: '#ef4444' }} />
                              ) : (
                                <CheckCircle2 style={{ height: '20px', width: '20px', color: '#fb8c00' }} />
                              )
                            ) : (
                              <Circle style={{ height: '20px', width: '20px', color: '#9ca3af' }} />
                            )}
                          </button>
                          <div>
                            <p
                              style={{
                                fontWeight: '500',
                                textDecoration: todo.completed && todo.validationStatus === "success" ? 'line-through' : 'none',
                                color: todo.completed && todo.validationStatus === "success" ? '#6b7280' : 'inherit'
                              }}
                            >
                              {todo.action}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
                              <span style={{ marginRight: '16px' }}>
                                ⏳ {calculateDaysRemaining(todo)} days {todo.completed ? "to verify" : "to effect"}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {getStatusIcon(todo.validationStatus)}
                                {todo.validationMessage && (
                                  <span style={{ marginLeft: '4px', fontSize: '12px' }}>{todo.validationMessage}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        style={{
                          height: '24px',
                          color: '#9ca3af',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '20px'
                        }}
                        onClick={() => onRemoveTodo(todo.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sensor validator hook
const useSensorValidator = (sensorData: SensorData) => {
  // Update the validateRecommendation function to be more strict about validation
  const validateRecommendation = (todo: TodoItem): { status: ValidationStatus; message: string } => {
    if (!todo.completed) {
      return { status: "pending", message: "Waiting for action to be completed" };
    }

    // If not enough time has passed since completion
    const daysSinceCompletion = todo.completedDate
      ? Math.floor((new Date().getTime() - todo.completedDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceCompletion < Math.floor(todo.expectedDays / 2)) {
      return {
        status: "pending",
        message: `Check again in ${Math.floor(todo.expectedDays / 2) - daysSinceCompletion} days`,
      };
    }

    // Get current and previous sensor values
    const currentValue = getSensorValue(todo.sensorType, sensorData, 0);
    const previousValue = getSensorValue(todo.sensorType, sensorData, 1);
    const initialValue = getSensorValue(todo.sensorType, sensorData, Math.min(6, sensorData.dates.length - 1));

    // Validate based on sensor type and action
    if (
      todo.action.toLowerCase().includes("increase") ||
      todo.action.toLowerCase().includes("boost") ||
      todo.action.toLowerCase().includes("improve") ||
      todo.action.toLowerCase().includes("add")
    ) {
      // Check if there's a significant improvement (at least 5% increase)
      const minImprovement = initialValue * 0.05;
      if (currentValue > previousValue && currentValue - previousValue >= minImprovement) {
        const improvement = (currentValue - previousValue).toFixed(1);
        return {
          status: "success",
          message: `🍀 Working! ${formatSensorName(todo.sensorType)} rose from ${previousValue.toFixed(1)} to ${currentValue.toFixed(1)}`,
        };
      } else if (currentValue > previousValue) {
        return {
          status: "retry",
          message: `⚠️ Slight improvement detected, but not enough. Continue treatment.`,
        };
      } else {
        return {
          status: "failed",
          message: `❌ No improvement detected. Action may not be working as expected.`,
        };
      }
    } else if (todo.action.toLowerCase().includes("decrease") || todo.action.toLowerCase().includes("reduce")) {
      // Check if there's a significant decrease (at least 5% decrease)
      const minDecrease = initialValue * 0.05;
      if (currentValue < previousValue && previousValue - currentValue >= minDecrease) {
        const reduction = (previousValue - currentValue).toFixed(1);
        return {
          status: "success",
          message: `🍀 Working! ${formatSensorName(todo.sensorType)} decreased from ${previousValue.toFixed(1)} to ${currentValue.toFixed(1)}`,
        };
      } else if (currentValue < previousValue) {
        return {
          status: "retry",
          message: `⚠️ Slight decrease detected, but not enough. Continue treatment.`,
        };
      } else {
        return {
          status: "failed",
          message: `❌ No decrease detected. Action may not be working as expected.`,
        };
      }
    }

    // Default case
    return { status: "retry", message: "⚠️ Check again in 7 days" };
  };

  // Helper to get sensor value
  const getSensorValue = (sensorType: SensorType, data: SensorData, index: number): number => {
    switch (sensorType) {
      case "ph":
        return data.ph[data.ph.length - 1 - index];
      case "moisture":
        return data.moisture[data.moisture.length - 1 - index];
      case "humidity":
        return data.humidity[data.humidity.length - 1 - index];
      case "nitrogen":
        return data.npk.nitrogen[data.npk.nitrogen.length - 1 - index];
      case "phosphorus":
        return data.npk.phosphorus[data.npk.phosphorus.length - 1 - index];
      case "potassium":
        return data.npk.potassium[data.npk.potassium.length - 1 - index];
      case "temperature":
        return data.temperature[data.temperature.length - 1 - index];
      default:
        return 0;
    }
  };

  // Format sensor name for display
  const formatSensorName = (sensorType: SensorType): string => {
    switch (sensorType) {
      case "ph":
        return "pH";
      case "moisture":
        return "Moisture";
      case "humidity":
        return "Humidity";
      case "nitrogen":
        return "Nitrogen";
      case "phosphorus":
        return "Phosphorus";
      case "potassium":
        return "Potassium";
      case "temperature":
        return "Temperature";
      default:
        return sensorType;
    }
  };

  // Determine sensor type from action text
  const determineSensorType = (action: string): SensorType => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("ph") || actionLower.includes("lime") || actionLower.includes("sulfur")) {
      return "ph";
    } else if (
      actionLower.includes("moisture") ||
      actionLower.includes("irrigation") ||
      actionLower.includes("water")
    ) {
      return "moisture";
    } else if (
      actionLower.includes("humidity") ||
      actionLower.includes("mulch") ||
      actionLower.includes("ventilation")
    ) {
      return "humidity";
    } else if (actionLower.includes("nitrogen") || actionLower.includes("urea")) {
      return "nitrogen";
    } else if (actionLower.includes("phosphorus") || actionLower.includes("phosphate")) {
      return "phosphorus";
    } else if (actionLower.includes("potassium") || actionLower.includes("potash")) {
      return "potassium";
    } else if (actionLower.includes("temperature")) {
      return "temperature";
    }
    // Default to pH if we can't determine
    return "ph";
  };

  // Estimate days to effect based on action
  const estimateDaysToEffect = (action: string): number => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("lime") || actionLower.includes("sulfur")) {
      return 30; // pH adjustments take longer
    } else if (actionLower.includes("irrigation") || actionLower.includes("water")) {
      return 3; // Irrigation effects are quick
    } else if (actionLower.includes("mulch") || actionLower.includes("ventilation")) {
      return 5; // Humidity adjustments are relatively quick
    } else if (
      actionLower.includes("fertilizer") ||
      actionLower.includes("urea") ||
      actionLower.includes("phosphate") ||
      actionLower.includes("potash")
    ) {
      return 14; // Fertilizers take a couple weeks
    }
    // Default
    return 14;
  };

  return {
    validateRecommendation,
    determineSensorType,
    estimateDaysToEffect,
  };
};

// Main Farm Dashboard Component
const FarmDashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>(generateMockData());
  const [selectedCrop, setSelectedCrop] = useState<Crop>("Wheat");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [alternativeCrop, setAlternativeCrop] = useState<{ crop: Crop; yieldIncrease: number }>({
    crop: "Rice",
    yieldIncrease: 15,
  });
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>(generateWeatherForecast());
  const [plantingDate, setPlantingDate] = useState<string>(getRecommendedPlantingDate());

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const { validateRecommendation, determineSensorType, estimateDaysToEffect } = useSensorValidator(sensorData);

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("farmDashboardTodos");
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos, (key, value) => {
          if (key === "addedDate" || key === "completedDate") {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setTodos(parsedTodos);
      } catch (e) {
        console.error("Error parsing todos from localStorage", e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("farmDashboardTodos", JSON.stringify(todos));

    // Calculate completion percentage
    if (todos.length > 0) {
      const completed = todos.filter((todo) => todo.completed).length;
      setCompletionPercentage((completed / todos.length) * 100);
    } else {
      setCompletionPercentage(0);
    }
  }, [todos]);

  // Validate todos when sensor data changes
  useEffect(() => {
    if (todos.length > 0) {
      const updatedTodos = todos.map((todo) => {
        if (todo.completed) {
          const validation = validateRecommendation(todo);
          return {
            ...todo,
            validationStatus: validation.status,
            validationMessage: validation.message,
          };
        }
        return todo;
      });
      setTodos(updatedTodos);
    }
  }, [sensorData]);

  // Add a recommendation to the todo list
  const addTodo = (action: string) => {
    const sensorType = determineSensorType(action);
    const expectedDays = estimateDaysToEffect(action);

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      action,
      expectedDays,
      addedDate: new Date(),
      completed: false,
      validationStatus: "pending",
      validationMessage: "Waiting for action to be completed",
      sensorType,
    };

    setTodos((prev) => [...prev, newTodo]);
  };

  // Toggle a todo's completed status
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const completed = !todo.completed;

          // If marking as completed, set validation status to pending
          if (completed) {
            return {
              ...todo,
              completed,
              completedDate: new Date(),
              validationStatus: "pending",
              validationMessage: "Waiting for sensor data to validate",
            };
          }
          // If marking as not completed, reset validation status
          else {
            return {
              ...todo,
              completed,
              completedDate: undefined,
              validationStatus: "pending",
              validationMessage: "Waiting for action to be completed",
            };
          }
        }
        return todo;
      })
    );
  };

  // Remove a todo
  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Add all recommendations to the todo list
  const addAllRecommendations = () => {
    recommendations.forEach((recommendation) => {
      // Check if recommendation is already in the todo list
      const exists = todos.some((todo) => todo.action === recommendation);
      if (!exists) {
        addTodo(recommendation);
      }
    });
  };

  // Analyze crop data
  const analyzeCrop = () => {
    setRecommendations(generateRecommendations(sensorData, selectedCrop));
    setAlternativeCrop(getAlternativeCrop(selectedCrop, sensorData));
    setPlantingDate(getRecommendedPlantingDate());
  };

  // Add a function to simulate sensor improvements for completed actions
  // This will make the validation more realistic
  const simulateSensorImprovements = () => {
    // Only simulate improvements for completed todos
    const completedTodos = todos.filter(
      (todo) =>
        todo.completed &&
        todo.completedDate &&
        new Date().getTime() - todo.completedDate.getTime() > (todo.expectedDays * 24 * 60 * 60 * 1000) / 2
    );

    if (completedTodos.length === 0) return sensorData;

    // Create a copy of the current sensor data
    const newSensorData = { ...sensorData };

    // For each completed todo, improve the relevant sensor data
    completedTodos.forEach((todo) => {
      if (todo.validationStatus !== "success") {
        switch (todo.sensorType) {
          case "ph":
            if (todo.action.toLowerCase().includes("increase")) {
              newSensorData.ph = [...newSensorData.ph];
              newSensorData.ph[newSensorData.ph.length - 1] = Math.min(
                8.0,
                newSensorData.ph[newSensorData.ph.length - 1] + 0.3
              );
            } else if (todo.action.toLowerCase().includes("decrease")) {
              newSensorData.ph = [...newSensorData.ph];
              newSensorData.ph[newSensorData.ph.length - 1] = Math.max(
                5.0,
                newSensorData.ph[newSensorData.ph.length - 1] - 0.3
              );
            }
            break;
          case "moisture":
            if (todo.action.toLowerCase().includes("increase")) {
              newSensorData.moisture = [...newSensorData.moisture];
              newSensorData.moisture[newSensorData.moisture.length - 1] = Math.min(
                80,
                newSensorData.moisture[newSensorData.moisture.length - 1] + 10
              );
            } else if (todo.action.toLowerCase().includes("decrease")) {
              newSensorData.moisture = [...newSensorData.moisture];
              newSensorData.moisture[newSensorData.moisture.length - 1] = Math.max(
                20,
                newSensorData.moisture[newSensorData.moisture.length - 1] - 10
              );
            }
            break;
          case "humidity":
            if (todo.action.toLowerCase().includes("increase")) {
              newSensorData.humidity = [...newSensorData.humidity];
              newSensorData.humidity[newSensorData.humidity.length - 1] = Math.min(
                90,
                newSensorData.humidity[newSensorData.humidity.length - 1] + 10
              );
            } else if (todo.action.toLowerCase().includes("decrease") || todo.action.toLowerCase().includes("reduce")) {
              newSensorData.humidity = [...newSensorData.humidity];
              newSensorData.humidity[newSensorData.humidity.length - 1] = Math.max(
                30,
                newSensorData.humidity[newSensorData.humidity.length - 1] - 10
              );
            }
            break;
          case "nitrogen":
            if (todo.action.toLowerCase().includes("increase") || todo.action.toLowerCase().includes("boost")) {
              newSensorData.npk.nitrogen = [...newSensorData.npk.nitrogen];
              newSensorData.npk.nitrogen[newSensorData.npk.nitrogen.length - 1] = Math.min(
                100,
                newSensorData.npk.nitrogen[newSensorData.npk.nitrogen.length - 1] + 15
              );
            }
            break;
          case "phosphorus":
            if (todo.action.toLowerCase().includes("increase") || todo.action.toLowerCase().includes("improve")) {
              newSensorData.npk.phosphorus = [...newSensorData.npk.phosphorus];
              newSensorData.npk.phosphorus[newSensorData.npk.phosphorus.length - 1] = Math.min(
                100,
                newSensorData.npk.phosphorus[newSensorData.npk.phosphorus.length - 1] + 15
              );
            }
            break;
          case "potassium":
            if (todo.action.toLowerCase().includes("increase")) {
              newSensorData.npk.potassium = [...newSensorData.npk.potassium];
              newSensorData.npk.potassium[newSensorData.npk.potassium.length - 1] = Math.min(
                100,
                newSensorData.npk.potassium[newSensorData.npk.potassium.length - 1] + 15
              );
            }
            break;
        }
      }
    });

    return newSensorData;
  };

  // Update the refresh data interval to include sensor improvements
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new base data
      const newData = generateMockData();

      // Apply improvements based on completed todos
      const improvedData = simulateSensorImprovements();

      // Merge the improved data with the new data
      // Keep the last value from improved data, but use new data for historical values
      const mergedData = {
        ...newData,
        ph: [...newData.ph.slice(0, -1), improvedData.ph[improvedData.ph.length - 1]],
        moisture: [...newData.moisture.slice(0, -1), improvedData.moisture[improvedData.moisture.length - 1]],
        humidity: [...newData.humidity.slice(0, -1), improvedData.humidity[improvedData.humidity.length - 1]],
        npk: {
          nitrogen: [
            ...newData.npk.nitrogen.slice(0, -1),
            improvedData.npk.nitrogen[improvedData.npk.nitrogen.length - 1],
          ],
          phosphorus: [
            ...newData.npk.phosphorus.slice(0, -1),
            improvedData.npk.phosphorus[improvedData.npk.phosphorus.length - 1],
          ],
          potassium: [
            ...newData.npk.potassium.slice(0, -1),
            improvedData.npk.potassium[improvedData.npk.potassium.length - 1],
          ],
        },
        temperature: [
          ...newData.temperature.slice(0, -1),
          improvedData.temperature[improvedData.temperature.length - 1],
        ],
      };

      setSensorData(mergedData);
      setWeatherForecast(generateWeatherForecast());
    }, 10000); // Changed to 10 seconds for faster testing

    return () => clearInterval(interval);
  }, [todos]);

  // Initial analysis
  useEffect(() => {
    analyzeCrop();
  }, []);

  // Chart data for pH
  const phChartData = {
    labels: sensorData.dates,
    datasets: [
      {
        data: sensorData.ph,
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        fill: true,
      },
    ],
  };

  // Chart data for moisture
  const moistureChartData = {
    labels: sensorData.dates,
    datasets: [
      {
        data: sensorData.moisture,
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        fill: true,
      },
    ],
  };

  // Chart data for NPK
  const npkChartData = {
    labels: sensorData.dates,
    datasets: [
      {
        label: "Nitrogen",
        data: sensorData.npk.nitrogen,
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        fill: false,
      },
      {
        label: "Phosphorus",
        data: sensorData.npk.phosphorus,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        fill: false,
      },
      {
        label: "Potassium",
        data: sensorData.npk.potassium,
        borderColor: "#8bc34a",
        backgroundColor: "rgba(139, 195, 74, 0.1)",
        fill: false,
      },
    ],
  };

  // Chart data for temperature and humidity
  const temperatureHumidityChartData = {
    labels: sensorData.dates,
    datasets: [
      {
        label: "Temperature",
        data: sensorData.temperature,
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Humidity",
        data: sensorData.humidity,
        borderColor: "#66bb6a", // Lighter shade of green
        backgroundColor: "rgba(102, 187, 106, 0.1)",
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  // Temperature and humidity chart options
  const temperatureHumidityChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Humidity (%)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', marginTop:'35px' , marginBottom:'90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#2e7d32' }}>Farm Management Dashboard</h1>
        <a href="/schemes" style={{ textDecoration: 'none' }}>
          <button style={{
            backgroundColor: '#fb8c00',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Government Schemes
          </button>
        </a>
      </div>

      {/* Sensor Data Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* pH Card */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
              <Flask style={{ marginRight: '8px', height: '24px', width: '24px', color: '#2e7d32' }} />
              Soil pH
            </h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
              {sensorData.ph[sensorData.ph.length - 1]}
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>pH</span>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Healthy range: 5.0 - 8.0</div>
            <div style={{ height: '160px' }}>
              <Line options={chartOptions} data={phChartData} />
            </div>
          </div>
        </div>

        {/* Moisture Card */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
              <Droplet style={{ marginRight: '8px', height: '24px', width: '24px', color: '#2e7d32' }} />
              Soil Moisture
            </h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>
              {sensorData.moisture[sensorData.moisture.length - 1]}
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>%</span>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Healthy range: 20% - 80%</div>
            <div style={{ height: '160px' }}>
              <Line options={chartOptions} data={moistureChartData} />
            </div>
          </div>
        </div>

        {/* NPK Card */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
              <Leaf style={{ marginRight: '8px', height: '24px', width: '24px', color: '#2e7d32' }} />
              NPK Levels
            </h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Nitrogen</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {sensorData.npk.nitrogen[sensorData.npk.nitrogen.length - 1]}
                  <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>ppm</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Phosphorus</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {sensorData.npk.phosphorus[sensorData.npk.phosphorus.length - 1]}
                  <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>ppm</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Potassium</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {sensorData.npk.potassium[sensorData.npk.potassium.length - 1]}
                  <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>ppm</span>
                </div>
              </div>
            </div>
            <div style={{ height: '160px' }}>
              <Line
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, legend: { display: true, position: "top" } },
                }}
                data={npkChartData}
              />
            </div>
          </div>
        </div>

        {/* Temperature & Humidity Card */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
              <Thermometer style={{ marginRight: '8px', height: '24px', width: '24px', color: '#2e7d32' }} />
              Temperature & Humidity
            </h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Temperature</div>
                <div style={{ fontSize: '30px', fontWeight: 'bold' }}>
                  {sensorData.temperature[sensorData.temperature.length - 1]}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>°C</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>Humidity</div>
                <div style={{ fontSize: '30px', fontWeight: 'bold' }}>
                  {sensorData.humidity[sensorData.humidity.length - 1]}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '4px' }}>%</span>
                </div>
              </div>
            </div>
            <div style={{ height: '160px' }}>
              <Line options={temperatureHumidityChartOptions} data={temperatureHumidityChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Planning and Smart Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Crop Planning Section */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', color: '#2e7d32' }}>Crop Planning</h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="crop-select" style={{ fontSize: '14px', fontWeight: '500' }}>
                  Select Crop
                </label>
                <select
                  id="crop-select"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value as Crop)}
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Rice">Rice</option>
                </select>
              </div>

              <button
                onClick={analyzeCrop}
                style={{
                  width: '100%',
                  backgroundColor: '#fb8c00',
                  color: 'white',
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Analyze
              </button>

              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>AI Recommendations</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recommendations.map((recommendation, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{
                          display: 'inline-block',
                          height: '8px',
                          width: '8px',
                          borderRadius: '9999px',
                          backgroundColor: '#fb8c00',
                          marginTop: '8px',
                          marginRight: '8px'
                        }}></span>
                        <span>{recommendation}</span>
                      </div>
                      <button
                        style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          height: '28px',
                          border: '1px solid #fb8c00',
                          color: '#fb8c00',
                          backgroundColor: 'transparent',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => addTodo(recommendation)}
                      >
                        Follow
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    backgroundColor: '#fb8c00',
                    color: 'white',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={addAllRecommendations}
                >
                  Follow All Recommendations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Suggestions */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', color: '#2e7d32' }}>Smart Suggestions</h2>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Alternative Crop */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Alternative Crop</h3>
                <div style={{ padding: '16px', backgroundColor: '#f0f9f0', borderRadius: '8px' }}>
                  <p style={{ fontSize: '18px' }}>
                    Switch to <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>{alternativeCrop.crop}</span> for
                    <span style={{ fontWeight: 'bold', color: '#fb8c00' }}> +{alternativeCrop.yieldIncrease}% </span>
                    potential yield increase
                  </p>
                </div>
              </div>

              {/* Weather-based Planting Calendar */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Weather-based Planting Calendar</h3>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                    Recommended start date: <span style={{ fontWeight: 'bold', color: '#fb8c00' }}>{plantingDate}</span>
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {weatherForecast.map((day, index) => (
                    <div key={index} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontWeight: '500' }}>{day.date}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                        <WeatherIcon condition={day.condition} />
                      </div>
                      <p style={{ fontSize: '14px' }}>{day.temperature}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TodoList
        todos={todos}
        onToggleTodo={toggleTodo}
        onRemoveTodo={removeTodo}
        completionPercentage={completionPercentage}
      />
    </div>
  );
};

export default FarmDashboard;
