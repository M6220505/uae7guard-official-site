export type ExternalSignalSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ExternalSignal = {
  source: string;
  severity: ExternalSignalSeverity;
  id?: string;
  note?: string;
};

export type SimulationSummary = {
  reverted?: boolean;
  delegateCallDetected?: boolean;
  selfDestructDetected?: boolean;
  createdContract?: boolean;
  unlimitedApprovalDetected?: boolean;
  touchedUnknownContracts?: number;
};

export type AnalyzePayload = {
  address: string;
  transactionValue: number;
  historicalAddresses: string[];
  chainId?: number;
  from?: string;
  data?: string;
  externalSignals: ExternalSignal[];
  simulation?: SimulationSummary;
};
