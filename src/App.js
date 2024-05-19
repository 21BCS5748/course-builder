import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  IconButton,
  Container,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  Box,
  Paper,
  Collapse,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Description,
  Assignment,
  Book,
  HelpOutline,
  ContactMail,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import './App.css';
import backgroundImage from './background.jpg';

const App = () => {
  const [courses, setCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [resourceInputs, setResourceInputs] = useState({});
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [openCourseId, setOpenCourseId] = useState(null);
  const [openModuleId, setOpenModuleId] = useState(null);

  const createCourse = () => {
    const course = { id: Date.now(), title: newCourseTitle, description: newCourseDescription, modules: [] };
    setCourses([...courses, course]);
    setNewCourseTitle('');
    setNewCourseDescription('');
    setSelectedCourseId(course.id);
  };

  const addModule = (courseId) => {
    const module = { id: Date.now(), title: newModuleTitle, resources: [] };
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        course.modules.push(module);
      }
      return course;
    });
    setCourses(updatedCourses);
    setNewModuleTitle('');
    setSelectedModuleId(module.id);
  };

  const addResource = (courseId, moduleId) => {
    const moduleInput = resourceInputs[moduleId] || {};
    const { title, type, data } = moduleInput;
    let resourceData = data;

    if (type !== 'link' && data instanceof File) {
      resourceData = URL.createObjectURL(data);
    }

    const resource = { id: Date.now(), title, type, data: resourceData };
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        course.modules = course.modules.map(module => {
          if (module.id === moduleId) {
            module.resources.push(resource);
          }
          return module;
        });
      }
      return course;
    });

    setCourses(updatedCourses);
    setResourceInputs({
      ...resourceInputs,
      [moduleId]: { title: '', type: 'link', data: '' }
    });
  };

  const handleResourceInputChange = (moduleId, field, value) => {
    setResourceInputs({
      ...resourceInputs,
      [moduleId]: {
        ...resourceInputs[moduleId],
        [field]: value
      }
    });
  };

  const handleRename = (id, type, newName) => {
    const updatedCourses = courses.map(course => {
      if (course.id === id) {
        if (type === 'course') {
          course.title = newName;
        } else {
          course.modules = course.modules.map(module => {
            if (module.id === id) {
              module.title = newName;
            }
            if (type === 'resource') {
              module.resources = module.resources.map(resource => {
                if (resource.id === id) {
                  resource.title = newName;
                }
                return resource;
              });
            }
            return module;
          });
        }
      }
      return course;
    });
    setCourses(updatedCourses);
  };

  const handleDelete = (id, type) => {
    const updatedCourses = courses.map(course => {
      if (type === 'course') {
        if (course.id === id) return null;
      } else {
        course.modules = course.modules.filter(module => module.id !== id);
        course.modules.forEach(module => {
          module.resources = module.resources.filter(resource => resource.id !== id);
        });
      }
      return course;
    }).filter(Boolean);
    setCourses(updatedCourses);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId, type } = result;

    if (type === 'module') {
      const sourceCourseIndex = courses.findIndex(course => course.id === parseInt(source.droppableId.split('-')[1]));
      const destCourseIndex = courses.findIndex(course => course.id === parseInt(destination.droppableId.split('-')[1]));

      if (sourceCourseIndex === -1 || destCourseIndex === -1) return;

      const [movedModule] = courses[sourceCourseIndex].modules.splice(source.index, 1);
      courses[destCourseIndex].modules.splice(destination.index, 0, movedModule);

    } else if (type === 'resource') {
      const courseId = parseInt(source.droppableId.split('-')[1]);
      const sourceModuleId = parseInt(source.droppableId.split('-')[2]);
      const destModuleId = parseInt(destination.droppableId.split('-')[2]);

      const sourceCourseIndex = courses.findIndex(course => course.id === courseId);
      const sourceModuleIndex = courses[sourceCourseIndex].modules.findIndex(module => module.id === sourceModuleId);
      const destModuleIndex = courses[sourceCourseIndex].modules.findIndex(module => module.id === destModuleId);

      if (sourceCourseIndex === -1 || sourceModuleIndex === -1 || destModuleIndex === -1) return;

      const [movedResource] = courses[sourceCourseIndex].modules[sourceModuleIndex].resources.splice(source.index, 1);
      courses[sourceCourseIndex].modules[destModuleIndex].resources.splice(destination.index, 0, movedResource);
    }

    setCourses([...courses]);
  };

  const toggleCourse = (courseId) => {
    setOpenCourseId(openCourseId === courseId ? null : courseId);
  };

  const toggleModule = (moduleId) => {
    setOpenModuleId(openModuleId === moduleId ? null : moduleId);
  };

  return (
    <div className="App" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Course Builder</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box mt={4} mb={4} p={3} component={Paper} elevation={3}>
              <Typography variant="h3" color="primary" className="title">Course Builder Tool</Typography>
              <Box mt={4} mb={4}>
                <Typography variant="h5">Create New Course</Typography>
                <TextField
                  label="Course Title"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Course Description"
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button variant="contained" color="primary" onClick={createCourse} startIcon={<Add />}>
                  Create Course
                </Button>
              </Box>
              <Box mb={4}>
                <Typography variant="h6">Add Module to Existing Course</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Course</InputLabel>
                  <Select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {courses.map(course => (
                      <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Module Title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addModule(selectedCourseId)}
                  startIcon={<Add />}
                  disabled={!selectedCourseId}
                >
                  Add Module
                </Button>
              </Box>
              <Box mb={4}>
                <Typography variant="h6">Add Resource to Existing Module</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Course</InputLabel>
                  <Select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedModuleId('');
                    }}
                  >
                    {courses.map(course => (
                      <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedCourseId && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select Module</InputLabel>
                    <Select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                    >
                      {courses.find(course => course.id === selectedCourseId)?.modules.map(module => (
                        <MenuItem key={module.id} value={module.id}>{module.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {selectedModuleId && (
                  <Box>
                    <TextField
                      label="Resource Title"
                      value={(resourceInputs[selectedModuleId] || {}).title || ''}
                      onChange={(e) => handleResourceInputChange(selectedModuleId, 'title', e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={(resourceInputs[selectedModuleId] || {}).type || 'link'}
                        onChange={(e) => handleResourceInputChange(selectedModuleId, 'type', e.target.value)}
                      >
                        <MenuItem value="link">Link</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                      </Select>
                    </FormControl>
                    {(resourceInputs[selectedModuleId] || {}).type === 'link' ? (
                      <TextField
                        label="Resource Link"
                        value={(resourceInputs[selectedModuleId] || {}).data || ''}
                        onChange={(e) => handleResourceInputChange(selectedModuleId, 'data', e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => handleResourceInputChange(selectedModuleId, 'data', e.target.files[0])}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => addResource(selectedCourseId, selectedModuleId)}
                      startIcon={<Add />}
                    >
                      Add Resource
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="courses" type="module">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {courses.map((course, courseIndex) => (
                      <Draggable key={course.id} draggableId={`course-${course.id}`} index={courseIndex}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card>
                              <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Box display="flex" alignItems="center">
                                    <Book style={{ marginRight: '10px' }} />
                                    <Typography variant="h6">{course.title}</Typography>
                                  </Box>
                                  <IconButton onClick={() => toggleCourse(course.id)}>
                                    {openCourseId === course.id ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </Box>
                                <Typography variant="body2">{course.description}</Typography>
                              </CardContent>
                              <Collapse in={openCourseId === course.id} timeout="auto" unmountOnExit>
                                <CardContent>
                                  <Droppable droppableId={`course-${course.id}`} type="module">
                                    {(provided) => (
                                      <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {course.modules.map((module, moduleIndex) => (
                                          <Draggable key={module.id} draggableId={`module-${module.id}`} index={moduleIndex}>
                                            {(provided) => (
                                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <Card>
                                                  <CardContent>
                                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                                      <Box display="flex" alignItems="center">
                                                        <Assignment style={{ marginRight: '10px' }} />
                                                        <Typography variant="subtitle1">{module.title}</Typography>
                                                      </Box>
                                                      <IconButton onClick={() => toggleModule(module.id)}>
                                                        {openModuleId === module.id ? <ExpandLess /> : <ExpandMore />}
                                                      </IconButton>
                                                    </Box>
                                                  </CardContent>
                                                  <CardActions>
                                                    <IconButton onClick={() => handleRename(module.id, 'module', prompt('New Module Title:'))}>
                                                      <Edit />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(module.id, 'module')}>
                                                      <Delete />
                                                    </IconButton>
                                                  </CardActions>
                                                  <Collapse in={openModuleId === module.id} timeout="auto" unmountOnExit>
                                                    <CardContent>
                                                      <Droppable droppableId={`module-${course.id}-${module.id}`} type="resource">
                                                        {(provided) => (
                                                          <div ref={provided.innerRef} {...provided.droppableProps}>
                                                            {module.resources.map((resource, resourceIndex) => (
                                                              <Draggable key={resource.id} draggableId={`resource-${resource.id}`} index={resourceIndex}>
                                                                {(provided) => (
                                                                  <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ marginBottom: '10px' }}>
                                                                    <CardContent>
                                                                      <Box display="flex" alignItems="center">
                                                                        <Description style={{ marginRight: '10px' }} />
                                                                        <Typography variant="body2">{resource.title}</Typography>
                                                                      </Box>
                                                                      {resource.type === 'link' && <a href={resource.data} target="_blank" rel="noopener noreferrer">{resource.data}</a>}
                                                                      {resource.type === 'image' && <img src={resource.data} alt={resource.title} style={{ maxWidth: '100%' }} />}
                                                                      {resource.type === 'pdf' && <a href={resource.data} target="_blank" rel="noopener noreferrer">View PDF</a>}
                                                                    </CardContent>
                                                                    <CardActions>
                                                                      <IconButton onClick={() => handleRename(resource.id, 'resource', prompt('New Resource Title:'))}>
                                                                        <Edit />
                                                                      </IconButton>
                                                                      <IconButton onClick={() => handleDelete(resource.id, 'resource')}>
                                                                        <Delete />
                                                                      </IconButton>
                                                                    </CardActions>
                                                                  </Card>
                                                                )}
                                                              </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                          </div>
                                                        )}
                                                      </Droppable>
                                                    </CardContent>
                                                  </Collapse>
                                                </Card>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </CardContent>
                              </Collapse>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>
        </Grid>
      </Container>
      <IconButton
        color="primary"
        style={{ position: 'fixed', right: '20px', bottom: '60px' }}
        onClick={() => alert('Help: This is a Course Builder tool where you can create courses, add modules, and attach resources.')}
      >
        <HelpOutline fontSize="large" />
      </IconButton>
      <IconButton
        color="secondary"
        style={{ position: 'fixed', right: '20px', bottom: '20px' }}
        onClick={() => alert('Contact Us: For any inquiries, please reach out to us at support@example.com.')}
      >
        <ContactMail fontSize="large" />
      </IconButton>
    </div>
  );
};

export default App;
