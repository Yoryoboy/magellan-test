import axios from "axios";
import { CLICKUP_API_KEY } from "../config";

const clickUp = axios.create({
    baseURL: "https://api.clickup.com/api/v2",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  
  clickUp.interceptors.request.use(
    (config) => {
      config.headers.Authorization = CLICKUP_API_KEY;
      return config;
    },
    (error) => Promise.reject(error)
  );

/**
 * Verifies if a task ID exists in ClickUp
 * @param taskId - The ID of the task to verify
 * @returns Promise with the task data if it exists
 */
interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  value: string | null;
  [key: string]: unknown;
}

interface ClickUpTaskResponse {
  id: string;
  custom_id: string | null;
  name: string;
  custom_fields?: ClickUpCustomField[];
  [key: string]: unknown;
}

export const verifyTaskId = async (taskId: string): Promise<{ valid: boolean; data?: ClickUpTaskResponse; error?: string }> => {
  try {
    const response = await clickUp.get(`/task/${taskId}`);
    const taskData = response.data as ClickUpTaskResponse;
    
    // Check if the test has already been taken
    if (taskData.custom_fields) {
      const testTakenField = taskData.custom_fields.find(
        field => field.id === "86425b73-fdae-43b8-9102-6e4b16ea79ea" && field.name === "TEST TAKEN"
      );
      
      if (testTakenField && testTakenField.value === "true") {
        return { 
          valid: false, 
          error: "This ID has already been used to take a test. Please contact your supervisor for a new ID."
        };
      }
    }
    
    return { valid: true, data: taskData };
  } catch (error: unknown) {
    const err = error as { response?: { status: number }; message?: string };
    console.error('Error verifying task ID:', err.message || 'Unknown error');
    return { 
      valid: false, 
      error: err.response?.status === 404 
        ? 'Invalid ID. Please check the ID provided by your supervisor.'
        : 'An error occurred while verifying the ID. Please try again.'
    };
  }
}