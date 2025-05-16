# Magellan Written Test Application

![Magellan Test Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Magellan+Written+Test)

A modern, React-based application for administering and managing written tests with seamless ClickUp integration for tracking and reporting.

## 🚀 Overview

The Magellan Written Test Application is a comprehensive solution designed to streamline the process of administering written tests, tracking results, and providing feedback. Built with React, TypeScript, and Vite, this application offers a smooth user experience while integrating with ClickUp for powerful task management and reporting capabilities.

## ✨ Features

### User-Facing Features
- **ID Verification**: Validates supervisor IDs against ClickUp tasks
- **Test Prevention**: Checks if a test has already been taken to prevent duplicates
- **User Registration**: Collects test-taker information
- **Interactive Quiz Interface**: Clean, responsive design for answering questions
- **Automatic Scoring**: Calculates scores and percentages based on answers
- **PDF Generation**: Creates beautifully formatted PDF summaries of test results

### ClickUp Integration Features
- **Task Verification**: Validates test IDs against ClickUp tasks
- **Status Automation**: Automatically updates task status throughout the test lifecycle
  - Sets status to "test in progress" when a user starts the test
  - Updates to "test approved" or "test failed" based on test results
- **Custom Field Updates**: Updates custom fields in ClickUp with test results
  - Percentage score
  - Numeric score
  - Test completion status
- **PDF Attachment**: Uploads the test summary PDF directly to the ClickUp task
- **Data Cleanup**: Automatically clears local data after successful submission

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS for responsive design
- **PDF Generation**: jsPDF for client-side PDF creation
- **API Integration**: Axios for ClickUp API communication
- **State Management**: React Hooks and Context API
- **Form Handling**: Custom form validation
- **Storage**: LocalStorage for data persistence between pages

## 🔄 Application Flow

1. **ID Verification Page**:
   - User enters a supervisor ID
   - Application validates the ID against ClickUp
   - Checks if the test has already been taken

2. **Registration Page**:
   - User enters their name and email
   - Application updates the ClickUp task status to "test in progress"

3. **Quiz Page**:
   - User answers multiple-choice questions
   - Progress is saved to localStorage

4. **Submission Process**:
   - Calculates final score and percentage
   - Generates a PDF summary with user information and results
   - Updates ClickUp task with results and changes status based on score
   - Uploads the PDF to the ClickUp task
   - Shows a completion message to the user
   - Clears localStorage data

## 🔌 ClickUp Integration Details

The application integrates with ClickUp through their API to provide a seamless workflow:

### API Endpoints Used
- `GET /task/{task_id}` - Verify task existence and check if test was taken
- `PUT /task/{task_id}` - Update task name, status, and dates
- `POST /task/{task_id}/field/{field_id}` - Update custom fields with test results
- `POST /task/{task_id}/attachment` - Upload PDF summary

### Custom Fields
- **Percentage**: Manual progress field for storing the percentage score
- **Score**: Number field for storing the raw score
- **Test Taken**: Checkbox field to mark if the test has been completed

### Task Statuses
- **Test In Progress**: Set when user starts the test
- **Test Approved**: Set when user passes the test (≥80%)
- **Test Failed**: Set when user fails the test (<80%)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- pnpm (preferred) or npm
- ClickUp API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yoryoboy/magellan-test.git
   cd magellan-test
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with your ClickUp API key:
   ```
   VITE_CLICKUP_API_AKEY=your_clickup_api_key
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

## 📋 Project Structure

```
magellan-written-test/
├── src/
│   ├── api/                 # API integration with ClickUp
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── questions/           # Test questions data
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── index.html              # HTML entry point
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies and scripts
```

## 🧪 Future Enhancements

- **Question Randomization**: Randomize question order for each test
- **Timed Tests**: Add support for timed tests with automatic submission
- **Multiple Test Types**: Support for different types of tests
- **Result Analytics**: Visual analytics for test results
- **User Authentication**: Add user authentication for more secure access

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by Jorge Díaz - [GitHub Profile](https://github.com/Yoryoboy)
