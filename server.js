const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS with specific configuration
app.use(cors({
  origin: '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
const jobPostingsPath = path.join(dataDir, 'job-postings.json');
const candidatesPath = path.join(dataDir, 'candidates.json');
const interviewsPath = path.join(dataDir, 'interviews.json');
const interviewProcessesPath = path.join(dataDir, 'interview-processes.json');

// Function to generate interview questions based on stage type and job details
async function generateInterviewQuestions(stageType, jobPosting, candidate) {
  // This is a placeholder implementation. In a real app, this would call an AI service
  const questions = [];
  
  switch (stageType) {
    case 'technical':
      questions.push(
        {
          id: uuidv4(),
          question: `Given your experience with ${candidate.skills.join(', ')}, how would you approach ${jobPosting.title} related technical challenges?`,
          category: 'Technical Skills',
          expectedAnswer: 'Looking for detailed technical knowledge and problem-solving approach'
        },
        {
          id: uuidv4(),
          question: 'Can you describe a challenging technical problem you solved in your previous role?',
          category: 'Problem Solving',
          expectedAnswer: 'Looking for structured problem-solving approach and technical depth'
        }
      );
      break;
      
    case 'behavioral':
      questions.push(
        {
          id: uuidv4(),
          question: 'Tell me about a time when you had to work under pressure to meet a deadline.',
          category: 'Time Management',
          expectedAnswer: 'Looking for prioritization and stress management skills'
        },
        {
          id: uuidv4(),
          question: 'How do you handle conflicts with team members?',
          category: 'Teamwork',
          expectedAnswer: 'Looking for conflict resolution and communication skills'
        }
      );
      break;
      
    case 'cultural_fit':
      questions.push(
        {
          id: uuidv4(),
          question: 'What aspects of our company culture appeal to you the most?',
          category: 'Cultural Alignment',
          expectedAnswer: 'Looking for alignment with company values and culture'
        },
        {
          id: uuidv4(),
          question: 'How do you prefer to receive feedback?',
          category: 'Communication',
          expectedAnswer: 'Looking for openness to feedback and growth mindset'
        }
      );
      break;
      
    case 'final':
      questions.push(
        {
          id: uuidv4(),
          question: 'Where do you see yourself in 5 years?',
          category: 'Career Goals',
          expectedAnswer: 'Looking for alignment between personal goals and company growth'
        },
        {
          id: uuidv4(),
          question: 'What questions do you have about the role or company?',
          category: 'Engagement',
          expectedAnswer: 'Looking for genuine interest and preparation'
        }
      );
      break;
  }
  
  return questions;
}

// Initialize data directory and files
async function initializeData() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true });

    // Initialize job postings file
    try {
      await fs.access(jobPostingsPath);
    } catch {
      console.log('Creating job-postings.json');
      await fs.writeFile(jobPostingsPath, JSON.stringify([]));
    }

    // Initialize candidates file
    try {
      await fs.access(candidatesPath);
    } catch {
      console.log('Creating candidates.json');
      await fs.writeFile(candidatesPath, JSON.stringify([]));
    }

    // Initialize interviews file
    try {
      await fs.access(interviewsPath);
    } catch {
      console.log('Creating interviews.json');
      await fs.writeFile(interviewsPath, JSON.stringify([]));
    }

    // Initialize interview processes file
    try {
      await fs.access(interviewProcessesPath);
    } catch {
      console.log('Creating interview-processes.json');
      await fs.writeFile(interviewProcessesPath, JSON.stringify([]));
    }

    console.log('Data initialization complete');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Initialize data before starting the server
initializeData().then(() => {
  // API endpoints
  app.get('/api/job-postings', async (req, res) => {
    try {
      const data = await fs.readFile(jobPostingsPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading job postings:', error);
      res.status(500).json({ error: 'Failed to read job postings' });
    }
  });

  app.post('/api/job-postings', async (req, res) => {
    try {
      const data = await fs.readFile(jobPostingsPath, 'utf-8');
      const postings = JSON.parse(data);
      
      const newPosting = {
        ...req.body,
        id: uuidv4()
      };
      
      postings.push(newPosting);
      await fs.writeFile(jobPostingsPath, JSON.stringify(postings, null, 2));
      res.json(newPosting);
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({ error: 'Failed to create job posting' });
    }
  });

  app.put('/api/job-postings/:id', async (req, res) => {
    try {
      const data = await fs.readFile(jobPostingsPath, 'utf-8');
      const postings = JSON.parse(data);
      const index = postings.findIndex(p => p.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Job posting not found' });
      }
      
      const updatedPosting = {
        ...req.body,
        id: req.params.id
      };
      
      postings[index] = updatedPosting;
      await fs.writeFile(jobPostingsPath, JSON.stringify(postings, null, 2));
      res.json(updatedPosting);
    } catch (error) {
      console.error('Error updating job posting:', error);
      res.status(500).json({ error: 'Failed to update job posting' });
    }
  });

  app.delete('/api/job-postings/:id', async (req, res) => {
    try {
      const data = await fs.readFile(jobPostingsPath, 'utf-8');
      const postings = JSON.parse(data);
      const filteredPostings = postings.filter(p => p.id !== req.params.id);
      
      if (filteredPostings.length === postings.length) {
        return res.status(404).json({ error: 'Job posting not found' });
      }
      
      await fs.writeFile(jobPostingsPath, JSON.stringify(filteredPostings, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      res.status(500).json({ error: 'Failed to delete job posting' });
    }
  });

  app.get('/api/candidates', async (req, res) => {
    try {
      const data = await fs.readFile(candidatesPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading candidates:', error);
      res.status(500).json({ error: 'Failed to read candidates' });
    }
  });

  app.post('/api/candidates', async (req, res) => {
    try {
      const data = await fs.readFile(candidatesPath, 'utf-8');
      const candidates = JSON.parse(data);
      
      const newCandidate = {
        ...req.body,
        id: uuidv4()
      };
      
      candidates.push(newCandidate);
      await fs.writeFile(candidatesPath, JSON.stringify(candidates, null, 2));
      res.json(newCandidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  });

  app.put('/api/candidates/:id', async (req, res) => {
    try {
      const data = await fs.readFile(candidatesPath, 'utf-8');
      const candidates = JSON.parse(data);
      const index = candidates.findIndex(c => c.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      
      const updatedCandidate = {
        ...req.body,
        id: req.params.id
      };
      
      candidates[index] = updatedCandidate;
      await fs.writeFile(candidatesPath, JSON.stringify(candidates, null, 2));
      res.json(updatedCandidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(500).json({ error: 'Failed to update candidate' });
    }
  });

  app.delete('/api/candidates/:id', async (req, res) => {
    try {
      const data = await fs.readFile(candidatesPath, 'utf-8');
      const candidates = JSON.parse(data);
      const filteredCandidates = candidates.filter(c => c.id !== req.params.id);
      
      if (filteredCandidates.length === candidates.length) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      
      await fs.writeFile(candidatesPath, JSON.stringify(filteredCandidates, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ error: 'Failed to delete candidate' });
    }
  });

  app.get('/api/interviews', async (req, res) => {
    try {
      const data = await fs.readFile(interviewsPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading interviews:', error);
      res.status(500).json({ error: 'Failed to read interviews' });
    }
  });

  app.post('/api/interviews', async (req, res) => {
    try {
      const data = await fs.readFile(interviewsPath, 'utf-8');
      const interviews = JSON.parse(data);
      
      const newInterview = {
        ...req.body,
        id: uuidv4()
      };
      
      interviews.push(newInterview);
      await fs.writeFile(interviewsPath, JSON.stringify(interviews, null, 2));
      res.json(newInterview);
    } catch (error) {
      console.error('Error creating interview:', error);
      res.status(500).json({ error: 'Failed to create interview' });
    }
  });

  app.patch('/api/interviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      
      // Load current interviews
      const interviews = await fs.readFile(interviewsPath, 'utf-8');
      const interviewsData = JSON.parse(interviews);
      
      // Find the interview to update
      const index = interviewsData.findIndex(i => i.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      // Update the interview
      const updatedInterview = {
        ...interviewsData[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      interviewsData[index] = updatedInterview;

      // If the stage status has changed to completed, update the interview process
      if (updatedInterview.stage.status === 'completed') {
        const processes = await fs.readFile(interviewProcessesPath, 'utf-8');
        const processesData = JSON.parse(processes);
        const processIndex = processesData.findIndex(p => p.id === updatedInterview.processId);
        
        if (processIndex !== -1) {
          const process = processesData[processIndex];
          const stageIndex = process.stages.findIndex(s => s.id === updatedInterview.stage.id);
          
          if (stageIndex !== -1) {
            // Update the stage status
            process.stages[stageIndex] = updatedInterview.stage;
            
            // If the stage was failed, mark the process as completed
            if (!updatedInterview.stage.passed) {
              process.status = 'completed';
            }
            // If the stage was passed and it was the last stage, mark the process as completed
            else if (stageIndex === process.stages.length - 1) {
              process.status = 'completed';
            }
            // Otherwise, move to the next stage
            else {
              process.currentStage = stageIndex + 1;
            }
            
            process.updatedAt = new Date().toISOString();
            processesData[processIndex] = process;
            await fs.writeFile(interviewProcessesPath, JSON.stringify(processesData, null, 2));
          }
        }
      }

      // Save the updated interviews
      await fs.writeFile(interviewsPath, JSON.stringify(interviewsData, null, 2));
      
      res.json(updatedInterview);
    } catch (error) {
      console.error('Error updating interview:', error);
      res.status(500).json({ error: 'Failed to update interview' });
    }
  });

  app.delete('/api/interviews/:id', async (req, res) => {
    try {
      const data = await fs.readFile(interviewsPath, 'utf-8');
      const interviews = JSON.parse(data);
      const filteredInterviews = interviews.filter(i => i.id !== req.params.id);
      
      if (filteredInterviews.length === interviews.length) {
        return res.status(404).json({ error: 'Interview not found' });
      }
      
      await fs.writeFile(interviewsPath, JSON.stringify(filteredInterviews, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting interview:', error);
      res.status(500).json({ error: 'Failed to delete interview' });
    }
  });

  app.get('/api/interview-processes', async (req, res) => {
    try {
      const data = await fs.readFile(interviewProcessesPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Error reading interview processes:', error);
      res.status(500).json({ error: 'Failed to read interview processes' });
    }
  });

  app.post('/api/interview-processes', async (req, res) => {
    try {
      console.log('Received request to create interview process:', req.body);
      
      const data = await fs.readFile(interviewProcessesPath, 'utf-8');
      const processes = JSON.parse(data);
      
      const newProcess = {
        ...req.body,
        id: uuidv4()
      };
      
      console.log('Creating new process with ID:', newProcess.id);
      
      // If any stages need AI-generated questions, generate them now
      if (req.body.generateQuestionsForStages && req.body.generateQuestionsForStages.length > 0) {
        console.log('Generating questions for stages:', req.body.generateQuestionsForStages);
        
        const jobPostingsData = await fs.readFile(jobPostingsPath, 'utf-8');
        const candidatesData = await fs.readFile(candidatesPath, 'utf-8');
        const jobPostings = JSON.parse(jobPostingsData);
        const candidates = JSON.parse(candidatesData);
        
        const jobPosting = jobPostings.find(jp => jp.id === newProcess.jobPostingId);
        const candidate = candidates.find(c => c.id === newProcess.candidateId);
        
        if (!jobPosting || !candidate) {
          console.error('Job posting or candidate not found:', { 
            jobPostingId: newProcess.jobPostingId, 
            candidateId: newProcess.candidateId 
          });
          throw new Error('Job posting or candidate not found');
        }
        
        // Generate questions for each stage that needs them
        for (const stage of newProcess.stages) {
          if (req.body.generateQuestionsForStages.includes(stage.id)) {
            console.log('Generating questions for stage:', stage.id);
            stage.questions = await generateInterviewQuestions(stage.type, jobPosting, candidate);
            console.log('Generated questions:', stage.questions);
          }
        }
      }
      
      processes.push(newProcess);
      await fs.writeFile(interviewProcessesPath, JSON.stringify(processes, null, 2));
      console.log('Successfully created interview process');
      res.json(newProcess);
    } catch (error) {
      console.error('Error creating interview process:', error);
      res.status(500).json({ error: 'Failed to create interview process' });
    }
  });

  app.get('/api/interview-processes/:id', async (req, res) => {
    try {
      const data = await fs.readFile(interviewProcessesPath, 'utf-8');
      const processes = JSON.parse(data);
      const process = processes.find(p => p.id === req.params.id);
      
      if (!process) {
        return res.status(404).json({ error: 'Interview process not found' });
      }
      
      res.json(process);
    } catch (error) {
      console.error('Error reading interview process:', error);
      res.status(500).json({ error: 'Failed to read interview process' });
    }
  });

  app.patch('/api/interview-processes/:id', async (req, res) => {
    try {
      const data = await fs.readFile(interviewProcessesPath, 'utf-8');
      const processes = JSON.parse(data);
      const index = processes.findIndex(p => p.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Interview process not found' });
      }
      
      const updatedProcess = {
        ...processes[index],
        ...req.body,
        id: req.params.id,
        updatedAt: new Date().toISOString()
      };
      
      processes[index] = updatedProcess;
      await fs.writeFile(interviewProcessesPath, JSON.stringify(processes, null, 2));
      res.json(updatedProcess);
    } catch (error) {
      console.error('Error updating interview process:', error);
      res.status(500).json({ error: 'Failed to update interview process' });
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`- GET/POST http://localhost:${PORT}/api/job-postings`);
    console.log(`- GET/POST http://localhost:${PORT}/api/candidates`);
    console.log(`- GET/POST http://localhost:${PORT}/api/interviews`);
    console.log(`- GET/POST/PATCH http://localhost:${PORT}/api/interview-processes`);
  });
}); 