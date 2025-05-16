import { clickUp } from './clickUp';
import { TaskStatus } from './clickUpSubmission';
import type { UserData } from '../types/testTypes';

/**
 * Update task status to "test in progress" and set task name when user starts the test
 */
export const updateTaskToInProgress = async (taskId: string, userData: UserData): Promise<boolean> => {
  try {
    await clickUp.put(`/task/${taskId}`, {
      status: TaskStatus.TEST_IN_PROGRESS,
      name: userData.name
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task status to in progress:', error);
    return false;
  }
};
