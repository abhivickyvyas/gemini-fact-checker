export enum Verdict {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  MIXED = 'MIXED',
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface FactCheckResult {
  verdict: Verdict;
  explanation: string;
  sources: GroundingChunk[];
}
