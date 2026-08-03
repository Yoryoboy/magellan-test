import { notion } from "./notion";
import type { Question } from "../types/question";
import type { UserData } from "../types/testTypes";
import { STORAGE_KEYS } from "../utils/localStorage";

export const TestStatus = {
  TEST_IN_PROGRESS: "test in progress",
  TEST_APPROVED: "test approved",
  TEST_FAILED: "test failed",
} as const;

const PASSING_PERCENTAGE = 80;

/**
 * Update the page to mark the test as started.
 */
export const startTest = async (
  pageId: string,
  userData: UserData
): Promise<boolean> => {
  try {
    await notion.patch(`/pages/${pageId}`, {
      properties: {
        Status: { select: { name: TestStatus.TEST_IN_PROGRESS } },
        Candidate: {
          title: [{ text: { content: userData.name } }],
        },
        Email: { email: userData.email },
        "Start Date": {
          date: { start: new Date(userData.startTime).toISOString() },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Error starting test:", error);
    return false;
  }
};

/**
 * Build rich text array for a Notion block from a string.
 * Splits into chunks if the content exceeds Notion's 2000-char limit per element.
 */
const richText = (content: string) => {
  const maxLen = 2000;
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += maxLen) {
    chunks.push(content.slice(i, i + maxLen));
  }
  return chunks.map((chunk) => ({
    type: "text",
    text: { content: chunk },
  }));
};

/**
 * Build a paragraph block.
 */
const paragraph = (text: string) => ({
  object: "block",
  type: "paragraph",
  paragraph: { rich_text: richText(text) },
});

/**
 * Build a heading_2 block.
 */
const heading2 = (text: string) => ({
  object: "block",
  type: "heading_2",
  heading_2: { rich_text: richText(text) },
});

/**
 * Build a divider block.
 */
const divider = () => ({
  object: "block",
  type: "divider",
  divider: {},
});

/**
 * Write test results as blocks to the Notion page.
 * Includes a human-readable summary and a JSON code block for machine parsing.
 */
const appendResultsToPage = async (
  pageId: string,
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number,
  status: string,
  totalPoints: number
): Promise<boolean> => {
  try {
    const statusEmoji = status === TestStatus.TEST_APPROVED ? "✅" : "❌";

    // Build blocks: summary + JSON data (keeps it under Notion's 100-block limit)
    const blocks: Record<string, unknown>[] = [
      heading2("Test Results"),
      paragraph(
        `Candidate: ${userData.name} — ${userData.email}`
      ),
      paragraph(`Score: ${score} / ${totalPoints} (${Math.round(percentage)}%)`),
      paragraph(`Result: ${status} ${statusEmoji}`),
      paragraph(`Completed: ${new Date().toLocaleString()}`),
      paragraph(`Questions answered: ${questions.length}`),
    ];

    // Add JSON block with full structured data
    const resultsJson = JSON.stringify({
      candidateName: userData.name,
      email: userData.email,
      score,
      totalPoints,
      percentage: Math.round(percentage),
      status,
      completedAt: new Date().toISOString(),
      questions: questions.map((q) => {
        const allCorrect =
          q.userAnswer &&
          q.userAnswer.length === q.correctAnswer.length &&
          q.userAnswer.every((a) => q.correctAnswer.includes(a));
        return {
          id: q.id,
          question: q.question,
          userAnswer: q.userAnswer || [],
          correctAnswer: q.correctAnswer,
          points: q.points,
          isCorrect: allCorrect ?? false,
        };
      }),
    });

    blocks.push(
      divider(),
      {
        object: "block",
        type: "code",
        code: {
          language: "json",
          rich_text: richText(resultsJson),
        },
      }
    );

    await notion.patch(`/blocks/${pageId}/children`, {
      children: blocks,
    });

    return true;
  } catch (error) {
    console.error("Error writing results to Notion:", error);
    return false;
  }
};

/**
 * Submit all test data to Notion.
 */
export const submitTestToNotion = async (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): Promise<{ success: boolean; errors: string[] }> => {
  if (!userData.taskId) {
    return {
      success: false,
      errors: ["No page ID found. Cannot submit test results."],
    };
  }

  const pageId = userData.taskId;
  const errors: string[] = [];
  const now = new Date().toISOString();

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const status =
    percentage >= PASSING_PERCENTAGE
      ? TestStatus.TEST_APPROVED
      : TestStatus.TEST_FAILED;

  // Update all properties in a single PATCH
  try {
    await notion.patch(`/pages/${pageId}`, {
      properties: {
        Status: { select: { name: status } },
        Score: { number: score },
        Percentage: { number: Math.round(percentage) },
        "Test Taken": { checkbox: true },
        "Completion Date": { date: { start: now } },
      },
    });
  } catch (error) {
    console.error("Error updating page properties:", error);
    errors.push("Failed to update test results");
  }

  // Write detailed results as blocks
  try {
    const written = await appendResultsToPage(
      pageId,
      userData,
      questions,
      score,
      percentage,
      status,
      totalPoints
    );
    if (!written) {
      errors.push("Failed to save detailed results");
    }
  } catch (error) {
    errors.push("Failed to save detailed results");
    console.error("Results write error:", error);
  }

  // Clear localStorage on success
  if (errors.length === 0) {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSION);
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      localStorage.removeItem("verifiedTaskId");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
};
