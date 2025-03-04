# `Inbox.ai` - Smart Email Assistant

## Introduction  
`Inbox.ai` is your smart assistant for managing emails effortlessly. By combining the capabilities of Google/Microsoft APIs and LLMs, it automates email replies, organizes your inbox with labels, and ensures you handle your email workflow efficiently.

---

## Features  
- **Automated Email Monitoring**: Tracks incoming emails and handles them intelligently.  
- **Sequential Reply Handling**: Manages email replies in the correct order to ensure clear communication.  
- **Integration with LLMs**: Uses LLM models to generate thoughtful and personalized email responses.  
- **Label Assignment**: Automatically categorizes emails for better organization.  
- **Task Management with BullMQ & Redis**: Handles background tasks efficiently for a seamless experience.

---

## Getting Started  
Follow these steps to set up Inbox.ai and start using it.  

### Prerequisites  
Before setting up the tool, make sure you have:  
1. **Node.js** installed.  
2. **Redis server** running.  
3. A **Google Cloud account** with access to the Gmail API.  
4. An **Groq API key** (if you're using the AI features).  

---

### Installation  

1. **Clone the Repository**:  
   ```bash
   git clone https://github.com/Aditya8840/Inbox.ai.git
   ```  

2. **Navigate to the Project Directory**:  
   ```bash
   cd Inbox.ai
   ```  

3. **Install Dependencies**:  
   ```bash
   npm install
   ```  

---

### Configuration  

1. **Set Up Environment Variables**:  
   - Rename the sample environment file:  
     ```bash
     mv .env.example .env
     ```  
   - Open the `.env` file and add the required details (Gmail API keys, OpenAI API key, etc.).  

---

### Running the Project  

1. **Start the Redis Server** (if not already running):  
   ```bash
   docker run --name my-redis-container -p 6379:6379 -d redis 
   ```  

2. **Run the Project**:  

   For development:  
   ```bash
   npm run dev
   ```  

   To build the project:  
   ```bash
   npm run build
   ```  

   To start the project:  
   ```bash
   npm run start
   ```  

---

## That’s it! 🎉  
`Inbox.ai` is now ready to help you manage your emails like a pro.