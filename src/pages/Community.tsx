import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Divider,
  Modal,
  styled,
  useTheme,
  useMediaQuery,
  Badge,
  Fab,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Input,
} from '@mui/material';
import {
  MicNone,
  Warning,
  BookmarkBorder,
  Bookmark,
  PhotoCamera,
  Comment,
  ThumbUp,
  Close,
  Help,
  Add,
  Image as ImageIcon,
  Mic,
  Stop,
  Videocam,
} from '@mui/icons-material';

// Add these type declarations at the top of the file after imports
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

// Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
  overflowY: 'auto',
}));

const CommunityCard = styled(Card)(({ theme }) => ({
  width: '100%',
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const ImageSection = styled(Box)(({ theme }) => ({
  width: '40%',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    '& .overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '300px',
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '60%',
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const StatusChip = styled(Chip)<{ status: 'solved' | 'in-progress' | 'new' }>(({ theme, status }) => ({
  backgroundColor: status === 'solved' 
    ? '#4CAF50' 
    : status === 'in-progress' 
    ? '#FFA726' 
    : '#2196F3',
  color: '#fff',
  fontWeight: 'bold',
}));

const EmergencyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: '#f44336',
    color: '#fff',
  },
}));

const AISolution = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: '1px solid #4CAF50',
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: '10%',
  right: '5%',
  backgroundColor: '#4CAF50',
  '&:hover': {
    backgroundColor: '#45a049',
  },
}));

const CreatePostModal = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  padding: theme.spacing(4),
  backgroundColor: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  border: '2px dashed #4CAF50',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
}));

const RecordButton = styled(IconButton)<{ isRecording: boolean }>(({ theme, isRecording }) => ({
  backgroundColor: isRecording ? '#f44336' : '#4CAF50',
  color: '#fff',
  '&:hover': {
    backgroundColor: isRecording ? '#d32f2f' : '#45a049',
  },
}));

const VoiceRecordButton = styled(IconButton)<{ isRecording: boolean }>(({ theme, isRecording }) => ({
  color: isRecording ? '#f44336' : 'inherit',
  '&:hover': {
    color: isRecording ? '#d32f2f' : theme.palette.primary.main,
  },
}));

interface CommunityPost {
  id: string;
  title: string;
  status: 'solved' | 'in-progress' | 'new';
  description: string;
  aiSolution: string;
  image: string;
  comments: number;
  helped: number;
  isBookmarked: boolean;
  voiceNotes?: string[];
  hasLiked?: boolean;
  video?: string;
  replies?: Array<{
    id: string;
    text: string;
    timestamp: string;
    voiceNote?: string;
  }>;
}

const VoiceNoteContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ReplyContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const Community: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postType, setPostType] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      title: 'Yellow Spots on Tomato Leaves',
      status: 'new',
      description: "I noticed yellow spots appearing on my tomato plant leaves. The spots seem to be spreading and I'm worried about the health of my plants.",
      aiSolution: 'Based on the image analysis, this appears to be Early Blight. Recommended actions: Remove affected leaves, improve air circulation, apply copper-based fungicide.',
      image: 'https://example.com/tomato-disease.jpg',
      comments: 5,
      helped: 12,
      isBookmarked: false,
    },
    {
      id: '2',
      title: 'Soil pH Issues in Cotton Field',
      status: 'in-progress',
      description: 'Cotton plants showing signs of nutrient deficiency. Soil testing revealed unusual pH levels across different sections of the field.',
      aiSolution: 'Soil analysis indicates pH variation from 5.2 to 7.8. Recommend sectional lime application and regular monitoring.',
      image: 'https://example.com/cotton-field.jpg',
      comments: 8,
      helped: 15,
      isBookmarked: true,
    },
  ]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [replies, setReplies] = useState<{ [key: string]: string }>({});
  const [replyVoiceNote, setReplyVoiceNote] = useState<{ [key: string]: string }>({});
  const [postVoiceNotes, setPostVoiceNotes] = useState<string[]>([]);
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [replyRecording, setReplyRecording] = useState<{ [key: string]: boolean }>({});
  const replyMediaRecorderRef = useRef<{ [key: string]: MediaRecorder | null }>({});

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    // Implement voice recognition logic here
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = async (type: 'reply' | 'post', postId?: string) => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (type === 'reply' && postId) {
          setReplies(prev => ({ ...prev, [postId]: transcript }));
        } else if (type === 'post') {
          setQuestion(transcript);
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      alert('Speech recognition is not supported in your browser');
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setQuestion(prev => prev + '\n[Voice Note Attached]');
          // Store the voice note to be added to the post
          setPostVoiceNotes(prev => [...prev, base64Audio]);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setVideoBlob(file);
    }
  };

  const handleCreatePost = () => {
    let videoUrl = '';
    if (videoBlob) {
      videoUrl = URL.createObjectURL(videoBlob);
    }

    const newPost: CommunityPost = {
      id: (communityPosts.length + 1).toString(),
      title: question,
      status: 'new',
      description: description,
      aiSolution: 'AI analysis pending...',
      image: postImage || 'https://via.placeholder.com/400x300',
      comments: 0,
      helped: 0,
      isBookmarked: false,
      voiceNotes: postVoiceNotes,
      hasLiked: false,
      video: videoUrl,
      replies: [],
    };

    setCommunityPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePost(false);
    setPostImage(null);
    setPostType('');
    setQuestion('');
    setDescription('');
    setAudioBlob(null);
    setVideoBlob(null);
    setVideoPreview(null);
    setPostVoiceNotes([]);
  };

  const handleBookmark = (postId: string) => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleLike = (postId: string) => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              helped: post.hasLiked ? post.helped - 1 : post.helped + 1,
              hasLiked: !post.hasLiked 
            }
          : post
      )
    );
  };

  const handleReplyChange = (postId: string, value: string) => {
    setReplies(prev => ({ ...prev, [postId]: value }));
  };

  const startReplyRecording = async (postId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      replyMediaRecorderRef.current[postId] = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setReplies(prev => ({ 
            ...prev, 
            [postId]: (prev[postId] || '') + ' [Voice Note Attached]' 
          }));
          setReplyVoiceNote(prev => ({ ...prev, [postId]: base64Audio }));
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setReplyRecording(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopReplyRecording = (postId: string) => {
    if (replyMediaRecorderRef.current[postId] && replyRecording[postId]) {
      replyMediaRecorderRef.current[postId]?.stop();
      replyMediaRecorderRef.current[postId]?.stream.getTracks().forEach(track => track.stop());
      setReplyRecording(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReplySubmit = (postId: string) => {
    if (replies[postId]?.trim() || replyVoiceNote[postId]) {
      setCommunityPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments + 1,
                replies: [
                  ...(post.replies || []),
                  {
                    id: Date.now().toString(),
                    text: replies[postId] || '',
                    timestamp: new Date().toLocaleString(),
                    voiceNote: replyVoiceNote[postId],
                  },
                ],
              }
            : post
        )
      );
      // Clear the reply input and voice note after submission
      setReplies(prev => ({ ...prev, [postId]: '' }));
      setReplyVoiceNote(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const toggleReplies = (postId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <MainContainer>
      <Box sx={{ maxWidth: 800, mx: 'auto', marginTop: '60px' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center"
        >
          Community Support
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          align="center" 
          sx={{ mb: 3, color: 'text.secondary' }}
        >
          Share and Learn from the Farming Community
        </Typography>
      </Box>
      
      {communityPosts.map((post) => (
        <CommunityCard key={post.id}>
          <ImageSection
            onClick={() => handleImageClick(post.image)}
            sx={{
              backgroundImage: `url(${post.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}
            >
              <PhotoCamera sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
          </ImageSection>

          <ContentSection>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ color: '#2D5A27', fontWeight: 'bold' }}>
                {post.title}
              </Typography>
              <IconButton onClick={() => handleBookmark(post.id)}>
                {post.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>

            <StatusChip
              label={post.status.toUpperCase()}
              status={post.status}
              size="small"
            />

            <Divider sx={{ borderStyle: 'dashed', borderColor: '#7A9972' }} />

            <Typography variant="body1" sx={{ '& strong': { color: '#000' } }}>
              <strong>Problem:</strong> {post.description}
            </Typography>

            {post.voiceNotes && post.voiceNotes.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Voice Notes:</Typography>
                {post.voiceNotes.map((note, index) => (
                  <VoiceNoteContainer key={index}>
                    <audio controls src={note} />
                  </VoiceNoteContainer>
                ))}
              </Box>
            )}

            <AISolution>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                AI Analysis & Solution
              </Typography>
              <Typography variant="body2">
                {post.aiSolution}
              </Typography>
            </AISolution>

            <Box display="flex" gap={2} alignItems="center">
              <IconButton onClick={() => toggleReplies(post.id)}>
                <Badge badgeContent={post.comments} color="primary">
                  <Comment />
                </Badge>
              </IconButton>
              <IconButton 
                onClick={() => handleLike(post.id)} 
                sx={{ p: 0 }}
              >
                <Badge badgeContent={post.helped} color="success">
                  <ThumbUp color={post.hasLiked ? "success" : "inherit"} />
                </Badge>
              </IconButton>
            </Box>

            {showReplies[post.id] && post.replies && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Replies:
                </Typography>
                {post.replies.map((reply) => (
                  <ReplyContainer key={reply.id}>
                    <Typography variant="body2">{reply.text}</Typography>
                    {reply.voiceNote && (
                      <Box mt={1}>
                        <audio controls src={reply.voiceNote} />
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {reply.timestamp}
                    </Typography>
                  </ReplyContainer>
                ))}
              </Box>
            )}

            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                value={replies[post.id] || ''}
                onChange={(e) => handleReplyChange(post.id, e.target.value)}
                placeholder="Share your experience or ask a question..."
                InputProps={{
                  endAdornment: (
                    <Box>
                      <VoiceRecordButton
                        isRecording={replyRecording[post.id] || false}
                        onClick={() => 
                          replyRecording[post.id] 
                            ? stopReplyRecording(post.id)
                            : startReplyRecording(post.id)
                        }
                      >
                        {replyRecording[post.id] ? <Stop /> : <MicNone />}
                      </VoiceRecordButton>
                    </Box>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleReplySubmit(post.id)}
                disabled={!replies[post.id]?.trim() && !replyVoiceNote[post.id]}
              >
                Reply
              </Button>
            </Box>

            {post.video && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Attached Video:
                </Typography>
                <video 
                  controls 
                  style={{ 
                    width: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px'
                  }}
                >
                  <source src={post.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Box>
            )}
          </ContentSection>
        </CommunityCard>
      ))}

      <FloatingActionButton 
        color="primary" 
        onClick={() => setShowCreatePost(true)}
        aria-label="add post"
      >
        <Add />
      </FloatingActionButton>

      <Modal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      >
        <CreatePostModal>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Share with Community
            </Typography>
            <IconButton onClick={() => setShowCreatePost(false)}>
              <Close />
            </IconButton>
          </Box>

          <ImagePreviewContainer onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {postImage ? (
              <img
                src={postImage}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box textAlign="center">
                <ImageIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 1 }} />
                <Typography>Click to upload an image</Typography>
              </Box>
            )}
          </ImagePreviewContainer>

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Select Category</FormLabel>
            <RadioGroup
              row
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              {['Crop', 'Plant', 'Fruit', 'Vegetable', 'Soil'].map((type) => (
                <FormControlLabel
                  key={type}
                  value={type.toLowerCase()}
                  control={<Radio color="success" />}
                  label={type}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ask your question
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 400))}
              placeholder="What would you like to ask the community? (400 words max)"
              InputProps={{
                endAdornment: (
                  <Box>
                    <IconButton onClick={() => handleVoiceInput('post')}>
                      <MicNone />
                    </IconButton>
                    <RecordButton
                      isRecording={isRecording}
                      onClick={isRecording ? stopRecording : startAudioRecording}
                    >
                      {isRecording ? <Stop /> : <Mic />}
                    </RecordButton>
                  </Box>
                ),
              }}
            />
            <Typography variant="caption" color="textSecondary">
              {question.length}/400 characters
            </Typography>
            {postVoiceNotes.length > 0 && (
              <Box mt={1}>
                <Typography variant="subtitle2">Voice Notes:</Typography>
                {postVoiceNotes.map((note, index) => (
                  <VoiceNoteContainer key={index}>
                    <audio controls src={note} />
                  </VoiceNoteContainer>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Describe your problem
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your issue..."
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Button
                startIcon={<Videocam />}
                onClick={() => videoInputRef.current?.click()}
                color="primary"
              >
                Record Video
              </Button>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                style={{ display: 'none' }}
              />
              {videoPreview && (
                <Box mt={2} width="100%">
                  <video 
                    controls 
                    src={videoPreview}
                    style={{ 
                      width: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setShowCreatePost(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleCreatePost}
              disabled={!postType || !question}
            >
              Share with Community
            </Button>
          </Box>
        </CreatePostModal>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90vh',
          }}
        >
          <IconButton
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              color: '#fff',
            }}
            onClick={() => setSelectedImage(null)}
          >
            <Close />
          </IconButton>
          <img
            src={selectedImage || ''}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Modal>

      {/* Q&A Modal */}
      <Modal
        open={showQAModal}
        onClose={() => setShowQAModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ maxWidth: 600, width: '90%', p: 3, maxHeight: '90vh', overflow: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Get Expert Help</Typography>
            <IconButton onClick={() => setShowQAModal(false)}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" gutterBottom>
            Describe your problem in detail or use voice input for assistance.
          </Typography>
          {/* Add Q&A form components here */}
        </Card>
      </Modal>
    </MainContainer>
  );
};

export default Community;