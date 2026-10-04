import { execute, query } from "@/lib/database";
import { CONCEPT_STATUS } from "@/lib/constants";

/**
 * Read + write operations for Tech Concepts — the things the user wants
 * to actually know, tracked separately from free-form learning notes.
 * Nothing here schedules review sessions; status changes stay manual.
 */

const STATUS_ORDER = [
  CONCEPT_STATUS.LEARNING,
  CONCEPT_STATUS.REVIEW,
  CONCEPT_STATUS.NOT_STARTED,
  CONCEPT_STATUS.LEARNED,
];

/**
 * @typedef {Object} Concept
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} description
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toConcept(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "",
    description: row.description ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All concepts: active first (learning → review → not_started → learned),
 * newest first within each status.
 * @returns {Promise<Concept[]>}
 */
export async function listConcepts() {
  try {
    const rows = await query(
      "SELECT * FROM tech_concepts ORDER BY created_at DESC",
    );
    const concepts = rows.map(toConcept);
    // Status rank sorted in JS — no enum literals in SQL.
    return concepts.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );
  } catch (error) {
    console.error("[concept.service:listConcepts]", error);
    throw new Error("Could not load your concepts. Please try again.");
  }
}

/**
 * @param {{ title: string, category?: string, description?: string,
 *   status?: string }} input
 * @returns {Promise<string>} id of the created concept
 */
export async function createConcept({
  title,
  category = "",
  description = "",
  status = CONCEPT_STATUS.NOT_STARTED,
}) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the concept a title");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO tech_concepts
         (id, title, category, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        trimmed,
        category.trim(),
        description.trim(),
        status,
        now,
        now,
      ],
    );
  } catch (error) {
    console.error("[concept.service:createConcept]", error);
    throw new Error("Could not save the concept. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, category: string,
 *   description: string, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateConcept({
  id,
  title,
  category,
  description,
  status,
}) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the concept a title");

  try {
    const result = await execute(
      `UPDATE tech_concepts
       SET title = ?, category = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        trimmed,
        category.trim(),
        description.trim(),
        status,
        new Date().toISOString(),
        id,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Concept ${id} not found`);
    }
  } catch (error) {
    console.error("[concept.service:updateConcept]", error);
    throw new Error("Could not update the concept. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteConcept({ id }) {
  try {
    const result = await execute("DELETE FROM tech_concepts WHERE id = ?", [
      id,
    ]);
    if (result.rowsAffected === 0) {
      throw new Error(`Concept ${id} not found`);
    }
  } catch (error) {
    console.error("[concept.service:deleteConcept]", error);
    throw new Error("Could not delete the concept. Please try again.");
  }
}
