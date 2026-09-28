from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class IncidentInvestigationRequest(BaseModel):
    """Request payload for initiating an incident investigation."""

    incident_id: str = Field(..., description="Unique incident identifier, e.g. INC-DEMO-001")
    service: str = Field(..., description="Service experiencing incident, e.g. payment-api")
    environment: str = Field(default="production", description="Environment, e.g. production, staging")
    symptoms: List[str] = Field(..., description="Observed incident symptoms or alerts")
    deployment_version: Optional[str] = Field(default=None, description="Current or recent deployment version")
    description: Optional[str] = Field(default=None, description="Optional narrative details or logs snippet")


class HistoricalEvidenceItem(BaseModel):
    """Evidence item retrieved from persistent Hindsight memory."""

    incident_id: Optional[str] = Field(default=None, description="Identifier of the historical incident or decision")
    service: Optional[str] = Field(default=None, description="Service affected in the historical memory")
    summary: str = Field(..., description="Concise summary of what occurred in this past incident")
    relevance_to_current: str = Field(..., description="Explanation of why this experience applies to the current incident")
    past_root_cause: Optional[str] = Field(default=None, description="Root cause discovered in past incident")
    effective_actions: List[str] = Field(default_factory=list, description="Actions that succeeded in the past")
    dangerous_actions: List[str] = Field(default_factory=list, description="Actions that failed or caused harm in the past")
    lessons_learned: List[str] = Field(default_factory=list, description="Lessons learned from past incident")


class InvestigationResult(BaseModel):
    """Structured response from the OpsMind investigation agent."""

    incident_id: str = Field(..., description="Current incident ID under investigation")
    service: str = Field(..., description="Target service")
    incident_summary: str = Field(..., description="Synthesized summary of current incident based on symptoms")
    historical_evidence: List[HistoricalEvidenceItem] = Field(
        default_factory=list,
        description="Historical incidents and engineering decisions retrieved from Hindsight",
    )
    possible_root_causes: List[str] = Field(
        ...,
        description="Hypothesized root causes grounded in historical evidence and current symptoms",
    )
    recommended_steps: List[str] = Field(
        ...,
        description="Prioritized, evidence-grounded action steps for the investigating engineer",
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Explicit cautions, anti-patterns, and actions to avoid based on past failures",
    )
    confidence: str = Field(
        ...,
        description="Confidence level in the assessment (e.g. 'High - Supported by Historical Precedents', 'Moderate', 'Low - Insufficient Historical Evidence')",
    )
    memory_used: bool = Field(
        ...,
        description="Whether persistent memory from Hindsight was available and leveraged",
    )
    memory_bank_id: Optional[str] = Field(default=None, description="Hindsight bank ID queried")
    raw_evidence_count: int = Field(default=0, description="Number of raw recall results retrieved from Hindsight")


class MemoryRecallRequest(BaseModel):
    """Request payload for testing Hindsight retrieval."""

    query: str = Field(..., description="Query string for memory recall")
    bank_id: Optional[str] = Field(default=None, description="Override default memory bank ID")
    max_tokens: int = Field(default=4096, description="Token budget for recall results")


class MemoryRecallResultItem(BaseModel):
    """Individual item returned from Hindsight recall."""

    id: Optional[str] = None
    text: str
    type: Optional[str] = None
    context: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MemoryRecallResponse(BaseModel):
    """Response payload for testing Hindsight retrieval."""

    query: str
    bank_id: str
    count: int
    results: List[MemoryRecallResultItem]
    prompt_representation: Optional[str] = None


class MemoryRetainRequest(BaseModel):
    """Request payload for storing engineering memories and postmortems."""

    incident_id: Optional[str] = Field(default=None, description="Incident identifier, e.g. INC-1042")
    memory_type: str = Field(default="incident", description="'incident', 'incident_postmortem', or 'decision'")
    title: Optional[str] = Field(default=None, description="Brief title of memory")
    service: str = Field(..., description="Service name")
    environment: str = Field(default="production", description="Environment")
    severity: Optional[str] = Field(default=None, description="Severity rating, e.g. SEV-1")
    deployment_version: Optional[str] = Field(default=None, description="Deployment version if applicable")
    symptoms: List[str] = Field(default_factory=list, description="Observed symptoms")
    suspected_cause: Optional[str] = Field(default=None, description="Suspected cause during triage")
    root_cause: Optional[str] = Field(default=None, description="Confirmed root cause (alias for confirmed_root_cause)")
    confirmed_root_cause: Optional[str] = Field(default=None, description="Confirmed root cause")
    investigation_steps: List[str] = Field(default_factory=list, description="Steps executed")
    actions_taken: List[str] = Field(default_factory=list, description="Remediation actions taken")
    resolution: str = Field(..., description="Final resolution description")
    outcome: str = Field(default="Successful", description="Outcome of resolution")
    impact: Optional[str] = Field(default=None, description="Business or technical impact")
    duration: Optional[str] = Field(default=None, description="Duration of incident")
    successful_actions: List[str] = Field(default_factory=list, description="Actions that worked")
    successful_approaches: List[str] = Field(default_factory=list, description="Approaches that worked")
    failed_actions: List[str] = Field(default_factory=list, description="Actions that failed or caused harm")
    failed_approaches: List[str] = Field(default_factory=list, description="Failed or harmful approaches")
    engineering_decisions: List[str] = Field(default_factory=list, description="Formal decisions made")
    warnings: List[str] = Field(default_factory=list, description="Warnings for future responders")
    lessons_learned: Optional[str | List[str]] = Field(default_factory=list, description="Lessons learned")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")

    @field_validator("resolution", "outcome", mode="after")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return v.strip()

    @field_validator("service", mode="after")
    @classmethod
    def validate_service(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Service name cannot be empty")
        return v.strip()

    def get_effective_root_cause(self) -> Optional[str]:
        return (self.root_cause or self.confirmed_root_cause or "").strip() or None

    def get_effective_successful_actions(self) -> List[str]:
        return list(dict.fromkeys(self.successful_actions + self.successful_approaches))

    def get_effective_failed_actions(self) -> List[str]:
        return list(dict.fromkeys(self.failed_actions + self.failed_approaches))

    def get_effective_lessons_learned(self) -> List[str]:
        if isinstance(self.lessons_learned, str):
            text = self.lessons_learned.strip()
            return [text] if text else []
        elif isinstance(self.lessons_learned, list):
            return [str(l).strip() for l in self.lessons_learned if str(l).strip()]
        return []


class MemoryRetainResponse(BaseModel):
    """Response payload after storing memory."""

    success: bool
    incident_id: Optional[str] = None
    bank_id: str
    items_count: int
    message: str


class IncidentResolutionRequest(BaseModel):
    """Request payload for resolving an incident and capturing structured postmortem."""

    incident_id: str = Field(..., min_length=1, description="Incident ID to resolve")
    service: str = Field(..., min_length=1, description="Service name")
    environment: str = Field(default="production", description="Environment")
    severity: str = Field(default="SEV-1", description="Severity, e.g. SEV-1")
    deployment_version: Optional[str] = Field(default=None, description="Deployment version")
    symptoms: List[str] = Field(default_factory=list, description="Symptoms observed")
    root_cause: str = Field(..., min_length=1, description="Root cause of incident")
    resolution: str = Field(..., min_length=1, description="Remediation steps that resolved issue")
    outcome: str = Field(default="Successful", min_length=1, description="Outcome of resolution")
    lessons_learned: Optional[str | List[str]] = Field(default=None, description="Lessons learned")
    successful_actions: List[str] = Field(default_factory=list, description="Actions that worked")
    failed_actions: List[str] = Field(default_factory=list, description="Actions that failed or caused harm")
    warnings: List[str] = Field(default_factory=list, description="Warnings for future incidents")
    investigation_steps: List[str] = Field(default_factory=list, description="Investigation steps taken")
    actions_taken: List[str] = Field(default_factory=list, description="Remediation actions taken")

    @field_validator("incident_id", "service", "root_cause", "resolution", "outcome", mode="after")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return v.strip()


class IncidentResolutionResponse(BaseModel):
    """Response returned when an incident is resolved and experience retained."""

    success: bool
    incident_id: str
    status: str
    resolved_at: str
    retained_memory: MemoryRetainResponse
    message: str
