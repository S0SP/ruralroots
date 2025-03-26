import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio, CircularProgress, IconButton, Tabs, Tab, Alert, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CloudUpload, Search, CameraAlt, Delete, CameraAltOutlined, Settings, FiberManualRecord } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { analyzeImage, AnalysisResult } from '../../services/geminiService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`image-source-tabpanel-${index}`}
      aria-labelledby={`image-source-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const ResultCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: '#f8f9fa',
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
  borderRadius: '8px',
});

const DiseaseDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt'|'granted'|'denied'>('prompt');

  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment variables');
      setError('API key not configured. Please check your environment setup.');
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handleOptionSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
    setError(null);
  };

  const clearImage = () => {
    setImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedOption) {
      setError('Please select both an image and analysis type');
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError('API key not configured. Please check your environment setup.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting analysis with file:', selectedFile.name);
      const analysisResult = await analyzeImage(selectedFile, selectedOption);
      setResult(analysisResult);
    } catch (err) {
      console.error('Error in handleAnalyze:', err);
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError('Failed to analyze image. Please check the console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      // Check if permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(result.state as 'prompt'|'granted'|'denied');
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionState(result.state as 'prompt'|'granted'|'denied');
          if (result.state === 'granted') {
            setCameraError(null);
            startCamera();
          }
        });
        
        return result.state === 'granted';
      }
      
      // Fallback for browsers that don't support permissions API
      return true;
    } catch (err) {
      console.error('Error checking camera permissions:', err);
      return true; // Try anyway
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    
    try {
      // Check permissions first
      const hasPermission = await checkCameraPermissions();
      
      if (permissionState === 'denied') {
        setCameraError('Camera access denied. Please update your browser settings to allow camera access.');
        return;
      }
      
      // Request access to the user's back-facing camera if available, otherwise use any camera
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      // Handle specific errors with user-friendly messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.');
        setPermissionState('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please ensure your device has a camera connected.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application.');
      } else if (error.name === 'OverconstrainedError') {
        // Try again with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            setStream(simpleStream);
            setIsCameraActive(true);
          }
        } catch (fallbackError) {
          setCameraError('Unable to access camera with requested settings.');
        }
      } else {
        setCameraError('Unable to access camera. Please check your device and browser settings.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            setImage(canvas.toDataURL('image/jpeg'));
            setError(null);
            setResult(null);
          }
        }, 'image/jpeg');
        
        stopCamera();
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // If switching away from camera tab, stop the stream
    if (newValue !== 1 && stream) {
      stopCamera();
    }
    
    // If switching to camera tab, start the camera
    if (newValue === 1 && !isCameraActive) {
      setCameraError(null); // Reset error when switching to camera tab
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Plant Disease Detection
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Upload a plant image to detect diseases and get treatment recommendations
          </p>
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-red-700">
                Warning: API key not configured. Some features may not work.
              </p>
            </div>
          )}
        </div>

        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, marginTop: '27px' }}>
          <Typography variant="h4" gutterBottom align="center">
            Disease Detection Tool
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Advanced Tools for Modern Farming
          </Typography>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .Mui-selected': {
                    color: '#4CAF50',
                    fontWeight: 'bold',
                  },
                  '& .MuiTab-root': {
                    borderBottom: tabValue === 0 ? '2px solid transparent' : (tabValue === 1 ? '2px solid transparent' : '2px solid transparent'),
                    '&.Mui-selected': {
                      borderBottom: '2px solid #4CAF50',
                    }
                  }
                }}
              >
                <Tab label="Upload" icon={<CloudUpload />} iconPosition="start" />
                <Tab label="Camera" icon={<CameraAlt />} iconPosition="start" />
              </Tabs>

              {/* Hidden canvas for capturing images */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <Box
                sx={{
                  border: '2px dotted #4CAF50',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  minHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <TabPanel value={tabValue} index={0}>
                  {image ? (
                    <Box sx={{ position: 'relative', width: '100%', mx: 'auto' }}>
                      <img
                        src={image}
                        alt="Uploaded"
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          borderRadius: 8,
                          maxHeight: '473px',
                          objectFit: 'contain'
                        }}
                      />
                      <IconButton
                        sx={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={clearImage}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      
                      <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6">Upload Image</Typography>
                      <Typography color="textSecondary">
                        Click to upload an image of your crop, soil, or plant
                      </Typography>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {image && !isCameraActive ? (
                    <Box sx={{ position: 'relative', width: '100%', mx: 'auto' }}>
                      <img
                        src={image}
                        alt="Captured"
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          borderRadius: 8,
                          maxHeight: '473px',
                          objectFit: 'contain'
                        }}
                      />
                      <IconButton
                        sx={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={clearImage}
                      >
                        <Delete />
                      </IconButton>
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setImage(null);
                          startCamera();
                        }}
                      >
                        Take New Photo
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative', width: '100%', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {cameraError ? (
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <CameraAltOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            {cameraError}
                          </Alert>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            You can still upload an image manually using the upload tab.
                          </Typography>
                          {permissionState === 'denied' && (
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<Settings />}
                              onClick={() => {
                                // Try to open browser settings if supported
                                if (window.location.protocol === 'https:') {
                                  alert('Please update your camera permissions in your browser settings and then return to this page.');
                                } else {
                                  alert('For camera access, this site needs to be accessed via HTTPS.');
                                }
                              }}
                            >
                              Update Permissions
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <>
                          <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: '16px', 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              display: 'flex',
                              gap: 2
                            }}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              onClick={captureImage}
                              sx={{ borderRadius: '50%', minWidth: '60px', height: '60px' }}
                            >
                              <CameraAlt />
                            </Button>
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                </TabPanel>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select what you're analyzing:
              </Typography>
              <RadioGroup value={selectedOption} onChange={handleOptionSelect}>
                {['crop', 'soil', 'plant'].map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio color="success" />}
                    label={option.charAt(0).toUpperCase() + option.slice(1)}
                  />
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    console.log('Current environment:', {
                      apiKeyExists: !!import.meta.env.VITE_GEMINI_API_KEY,
                      selectedFileExists: !!selectedFile,
                      selectedOption,
                    });
                  }}
                >
                  Debug Info
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              color="success"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
              onClick={handleAnalyze}
              disabled={!selectedFile || !selectedOption || isLoading}
            >
              {isLoading ? 'ANALYZING...' : 'ANALYZE IMAGE'}
            </Button>
          </Box>

          {result && (
            <ResultCard>
              <Typography variant="h6" gutterBottom color="#000000" fontWeight={10}>
                Analysis Results
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                  Disease Name & Type
                </Typography>
                <Typography sx={{ color: 'black', mb: 2 }}>
                  {result.diseaseName} {result.diseaseType && `- ${result.diseaseType}`}
                </Typography>

                <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                  Reason
                </Typography>
                <Typography sx={{ color: 'black', mb: 2 }}>
                  {result.reason}
                </Typography>

                <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                  Treatment Plan
                </Typography>
                <List>
                  {result.treatment.split('\n').map((step, index) => (
                    <ListItem key={index} sx={{ color: 'black', py: 0.5 }}>
                      <ListItemIcon>
                        <FiberManualRecord sx={{ color: 'black', fontSize: '8px' }} />
                      </ListItemIcon>
                      <ListItemText primary={step.trim()} sx={{ color: 'black' }} />
                    </ListItem>
                  ))}
                </List>
                {result.healTime && (
                  <Typography sx={{ color: 'black', mb: 2 }}>
                    Healing Time: {result.healTime}
                  </Typography>
                )}

                <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                  Future Precautions
                </Typography>
                <List>
                  {result.precautions.map((precaution, index) => (
                    <ListItem key={index} sx={{ color: 'black', py: 0.5 }}>
                      <ListItemIcon>
                        <FiberManualRecord sx={{ color: 'black', fontSize: '8px' }} />
                      </ListItemIcon>
                      <ListItemText primary={precaution} sx={{ color: 'black' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </ResultCard>
          )}
        </Box>
      </div>
    </div>
  );
};

export default DiseaseDetection; 