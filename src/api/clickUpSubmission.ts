import { clickUp } from './clickUp';
import type { Question } from '../types/question';
import type { UserData } from '../types/testTypes';
import { jsPDF } from 'jspdf';
import { generatePDFForUpload } from '../utils/pdfGenerator';

// Constants for custom field IDs
const CUSTOM_FIELD_IDS = {
  PERCENTAGE: '30e78776-5ab6-4a87-a237-36532747b00f',
  SCORE: '60de12c9-9b1c-43a8-af48-184953ac4b78',
  TEST_TAKEN: '86425b73-fdae-43b8-9102-6e4b16ea79ea'
};

// Task status constants
export const TaskStatus = {
  TEST_IN_PROGRESS: 'test in progress',
  TEST_APPROVED: 'test approved',
  TEST_FAILED: 'test failed'
} as const;

/**
 * Update task status
 */
export const updateTaskStatus = async (
  taskId: string,
  status: string
): Promise<boolean> => {
  try {
    await clickUp.put(`/task/${taskId}`, {
      status: status
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
};

/**
 * Update native task fields (name, dates)
 */
export const updateTaskNativeFields = async (
  taskId: string,
  userData: UserData
): Promise<boolean> => {
  try {
    const testName = userData.name;
    const now = new Date().getTime();
    
    await clickUp.put(`/task/${taskId}`, {
      name: testName,
      due_date: now,
      start_date: new Date(userData.startTime).getTime(),
      due_date_time: true,
      start_date_time: true
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task native fields:', error);
    return false;
  }
};

/**
 * Update the percentage custom field
 */
export const updateTaskPercentage = async (
  taskId: string,
  percentage: number
): Promise<boolean> => {
  try {
    const roundedPercentage = Math.round(percentage);
    
    await clickUp.post(`/task/${taskId}/field/${CUSTOM_FIELD_IDS.PERCENTAGE}`, {
      value: { current: roundedPercentage }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task percentage:', error);
    return false;
  }
};

/**
 * Update the score custom field
 */
export const updateTaskScore = async (
  taskId: string,
  score: number
): Promise<boolean> => {
  try {
    await clickUp.post(`/task/${taskId}/field/${CUSTOM_FIELD_IDS.SCORE}`, {
      value: score
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task score:', error);
    return false;
  }
};

/**
 * Mark the test as taken
 */
export const markTestAsTaken = async (
  taskId: string
): Promise<boolean> => {
  try {
    await clickUp.post(`/task/${taskId}/field/${CUSTOM_FIELD_IDS.TEST_TAKEN}`, {
      value: "true"
    });
    
    return true;
  } catch (error) {
    console.error('Error marking test as taken:', error);
    return false;
  }
};

/**
 * Upload PDF as attachment to the task
 */
export const uploadPdfToTask = async (
  taskId: string,
  pdf: jsPDF,
  fileName: string
): Promise<boolean> => {
  try {
    // Convert PDF to blob
    const pdfBlob = pdf.output('blob');
    
    // Create FormData
    const formData = new FormData();
    formData.append('attachment', pdfBlob, fileName);
    
    // Use the clickUp axios instance but override the content type
    // We need to create a custom config that will override the default headers
    await clickUp.post(`/task/${taskId}/attachment`, formData, {
      headers: {
        // Override the Content-Type header for this specific request
        'Content-Type': 'multipart/form-data',
        // Keep the Accept header
        'Accept': 'application/json'
        // The Authorization header will be added by the interceptor
      },
      // This tells axios not to try to JSON.stringify the FormData
      transformRequest: [(data) => data]
    });
    
    return true;
  } catch (error) {
    console.error('Error uploading PDF attachment:', error);
    return false;
  }
};

/**
 * Submit all test data to ClickUp
 */
export const submitTestToClickUp = async (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): Promise<{ success: boolean; errors: string[] }> => {
  if (!userData.taskId) {
    return { 
      success: false, 
      errors: ['No task ID found. Cannot submit test results.'] 
    };
  }
  
  const taskId = userData.taskId;
  const errors: string[] = [];
  
  // Update native fields
  const nativeFieldsUpdated = await updateTaskNativeFields(taskId, userData);
  if (!nativeFieldsUpdated) {
    errors.push('Failed to update task name and dates');
  }
  
  // Update percentage
  const percentageUpdated = await updateTaskPercentage(taskId, percentage);
  if (!percentageUpdated) {
    errors.push('Failed to update percentage field');
  }
  
  // Update score
  const scoreUpdated = await updateTaskScore(taskId, score);
  if (!scoreUpdated) {
    errors.push('Failed to update score field');
  }
  
  // Update status based on percentage
  const status = percentage >= 80 ? TaskStatus.TEST_APPROVED : TaskStatus.TEST_FAILED;
  const statusUpdated = await updateTaskStatus(taskId, status);
  if (!statusUpdated) {
    errors.push('Failed to update task status');
  }
  
  // Mark test as taken
  const testMarkedAsTaken = await markTestAsTaken(taskId);
  if (!testMarkedAsTaken) {
    errors.push('Failed to mark test as taken');
  }
  
  // Generate PDF
  try {
    const pdf = generatePDFForUpload(userData, questions, score, percentage);
    const fileName = `magellan-test-summary-${userData.name.replace(/\s+/g, '-')}.pdf`;
    
    // Upload PDF
    const pdfUploaded = await uploadPdfToTask(taskId, pdf, fileName);
    if (!pdfUploaded) {
      errors.push('Failed to upload PDF attachment');
    }
  } catch (error) {
    errors.push('Failed to generate or upload PDF');
    console.error('PDF generation or upload error:', error);
  }
  
  return {
    success: errors.length === 0,
    errors
  };
};
