import axios from "axios";
import { NOTION_API_KEY, NOTION_DATABASE_ID } from "../config";
import type { TestResults, ResultQuestion, AdminCandidate } from "../types/testTypes";
import { generateCandidateId } from "../utils/candidateId";

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

/**
 * Create a new test entry (candidate page) in the Notion database.
 * Only generates a random Candidate ID — the name/email are filled at registration.
 */
export const createTestEntry = async (): Promise<{
  success: boolean;
  pageId?: string;
  candidateId?: string;
  error?: string;
}> => {
  try {
    const candidateId = generateCandidateId();
    const response = await notion.post("/pages", {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Candidate: {
          title: [{ text: { content: "Pending Candidate" } }],
        },
        "Candidate ID": {
          rich_text: [{ text: { content: candidateId } }],
        },
      },
    });
    return { success: true, pageId: response.data.id, candidateId };
  } catch (error) {
    console.error("Error creating test entry:", error);
    return {
      success: false,
      error: "Failed to create the test entry. Please try again.",
    };
  }
};

/**
 * List every test entry (candidate page) in the database, newest first.
 * Returns null on API failure so callers can show an error.
 */
export const listCandidates = async (): Promise<AdminCandidate[] | null> => {
  try {
    const response = await notion.post(
      `/databases/${NOTION_DATABASE_ID}/query`,
      {
        page_size: 100,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
      }
    );

    return (response.data.results || []).map((page: Record<string, unknown>) => {
      const props = (page.properties || {}) as Record<
        string,
        Record<string, unknown>
      >;
      const richText = (key: string) =>
        (props[key]?.rich_text as { plain_text?: string }[])?.[0]?.plain_text ?? null;
      const date = (key: string) =>
        (props[key]?.date as { start?: string } | undefined)?.start ?? null;

      return {
        pageId: page.id as string,
        name:
          (props.Candidate?.title as { plain_text?: string }[])?.[0]
            ?.plain_text || "Unknown",
        candidateId: richText("Candidate ID") || "",
        email: (props.Email?.email as string) ?? null,
        status: (props.Status?.select as { name?: string } | undefined)?.name ?? "not started",
        score: (props.Score?.number as number) ?? null,
        percentage: (props.Percentage?.number as number) ?? null,
        testTaken: (props["Test Taken"]?.checkbox as boolean) ?? false,
        startDate: date("Start Date"),
        completionDate: date("Completion Date"),
      };
    });
  } catch (error) {
    console.error("Error listing candidates:", error);
    return null;
  }
};
