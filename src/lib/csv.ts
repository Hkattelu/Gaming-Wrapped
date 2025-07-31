import { Game } from '@/types';
import Papa from 'papaparse';

/**
 * A mapping from the exact HowLongToBeat CSV header string
 * to the desired camelCase key used in our Zod schema.
 */
const hltbHeaderToKeyMap = {
  "Title": "title",
  "Platform": "platform",
  "Playing": "playing",
  "Backlog": "backlog",
  "Replay": "replay",
  "Online": "online",
  "Custom-2": "custom2",
  "Custom-3": "custom3",
  "Completed": "completed",
  "Retired": "retired",
  "Retired Notes": "retiredNotes",
  "Start Date": "startDate",
  "Completion Date": "completionDate",
  "Playthrough": "playthrough",
  "Progress": "progress",
  "Main Story": "mainStory",
  "Main Story Notes": "mainStoryNotes",
  "Main + Extras": "mainPlusExtras",
  "Main + Extras Notes": "mainPlusExtrasNotes",
  "Completionist": "completionist",
  "Completionist Notes": "completionistNotes",
  "Speed Any%": "speedAnyPercent",
  "Speed Any% Notes": "speedAnyPercentNotes",
  "Speed 100%": "speed100Percent",
  "Speed 100% Notes": "speed100PercentNotes",
  "Co-Op": "coOp",
  "Multi-Player": "multiPlayer",
  "General Notes": "generalNotes",
  "Storefront": "storefront",
  "Review": "review",
  "Review Notes": "reviewNotes",
  "Added": "added",
  "Updated": "updated",
} as Record<string, string>;

/**
 * Converts a raw CSV header string into its corresponding schema key.
 * @param {string} header - The header string from the CSV file.
 * @returns {string|undefined} The matching camelCase key or undefined if not found.
 */
function convertHeaderToKey(header: string): string {
  return hltbHeaderToKeyMap[header] ?? header;
}

export function parseCsv(csvText: string): Game[] {
  let games: Game[] = [];
  let parseError;
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => convertHeaderToKey(header),
    error: (err: Error) => {
      parseError = err;
    },
    complete: (results: Papa.ParseResult<Game>) => {
      games = results.data;
    }
  });
  if (parseError) throw parseError;
  return games;
}