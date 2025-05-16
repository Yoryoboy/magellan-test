import { clickUp } from './clickUp';
import { TaskStatus } from './clickUpSubmission';

/**
 * Update task status to "test in progress" when user starts the test
 */
export const updateTaskToInProgress = async (taskId: string): Promise<boolean> => {
  try {
    await clickUp.put(`/task/${taskId}`, {
      status: TaskStatus.TEST_IN_PROGRESS
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task status to in progress:', error);
    return false;
  }
};
