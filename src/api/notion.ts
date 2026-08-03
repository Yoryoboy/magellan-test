import axios from "axios";
import { NOTION_API_KEY, NOTION_DATABASE_ID } from "../config";
import type { TestResults, ResultQuestion } from "../types/testTypes";

// Notion API client
export const notion = axios.create({
  baseURL: "/api/notion",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Notion-Version": "2022-06-28",
    "Authorization": `Bearer ${NOTION_API_KEY}`,
  },
});

// Candidate lookup result
interface CandidateResult {
  valid: boolean;
  alreadyTaken?: boolean;
  pageId?: string;
  candidateName?: string;
  error?: string;
}

/**
 * Verify a candidate exists in the database by Candidate ID.
 * If the test hasn't been taken, returns valid=true.
 * If already taken, returns alreadyTaken=true with pageId for redirecting to results.
 */
export const verifyCandidate = async (
  candidateId: string
): Promise<CandidateResult> => {
  try {
    // First try: find candidate who hasn't taken the test
    const response = await notion.post(
      `/databases/${NOTION_DATABASE_ID}/query`,
      {
        filter: {
          and: [
            {
              property: "Candidate ID",
              rich_text: { equals: candidateId },
            },
            {
              property: "Test Taken",
              checkbox: { equals: false },
            },
          ],
        },
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const page = response.data.results[0];
      const candidateName =
        page.properties?.Candidate?.title?.[0]?.plain_text || "Unknown";
      return { valid: true, pageId: page.id, candidateName };
    }

    // Second try: check if the ID exists at all (already taken)
    const allResults = await notion.post(
      `/databases/${NOTION_DATABASE_ID}/query`,
      {
        filter: {
          property: "Candidate ID",
          rich_text: { equals: candidateId },
        },
      }
    );

    if (allResults.data.results && allResults.data.results.length > 0) {
      const page = allResults.data.results[0];
      const candidateName =
        page.properties?.Candidate?.title?.[0]?.plain_text || "Unknown";
      return {
        valid: false,
        alreadyTaken: true,
        pageId: page.id,
        candidateName,
      };
    }

    return {
      valid: false,
      error: "Invalid ID. Please check the ID provided by your supervisor.",
    };
  } catch (error: unknown) {
    const err = error as { response?: { status: number }; message?: string };
    console.error("Error verifying candidate:", err.message || "Unknown error");
    return {
      valid: false,
      error:
        err.response?.status === 404
          ? "Database not found. Please contact your supervisor."
          : "An error occurred while verifying the ID. Please try again.",
    };
  }
};

/**
 * Fetch full test results from a Notion page.
 * Reads properties (score, percentage, status) and
 * parses the JSON code block with question data.
 */
export const fetchResults = async (
  pageId: string
): Promise<TestResults | null> => {
  try {
    // Get page properties
    const pageResponse = await notion.get(`/pages/${pageId}`);
    const props = pageResponse.data.properties;

    const candidateName =
      props?.Candidate?.title?.[0]?.plain_text || "Unknown";
    const score = props?.Score?.number ?? 0;
    const percentage = props?.Percentage?.number ?? 0;
    const status = props?.Status?.select?.name || "unknown";

    // Get block children to find the JSON code block
    const blocksResponse = await notion.get(`/blocks/${pageId}/children`);
    const blocks = blocksResponse.data.results || [];

    let questions: ResultQuestion[] = [];
    let totalPoints = 0;

    // Find the code block containing results JSON
    for (const block of blocks) {
      if (block.type === "code") {
        try {
          const codeText = block.code?.rich_text
            ?.map((t: { plain_text: string }) => t.plain_text)
            .join("");
          if (codeText) {
            const parsed = JSON.parse(codeText);
            if (parsed.questions && Array.isArray(parsed.questions)) {
              questions = parsed.questions;
              totalPoints =
                parsed.totalPoints ??
                questions.reduce(
                  (sum: number, q: ResultQuestion) => sum + q.points,
                  0
                );
            }
          }
        } catch {
          // Not our JSON block, skip
        }
      }
    }

    return {
      candidateName,
      score,
      percentage,
      status,
      totalPoints,
      questions,
    };
  } catch (error) {
    console.error("Error fetching results:", error);
    return null;
  }
};
