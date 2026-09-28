from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EngineeringMemory(BaseModel):
    """Rich domain representation of engineering experience to be stored in Hindsight."""

    incident_id: Optional[str] = Field(default=None, description="Identifier for incident or decision")
    memory_type: str = Field(default="incident", description="'incident' or 'decision'")
    title: Optional[str] = Field(default=None, description="Concise memory title")
    service: str = Field(..., description="Target service, e.g. payment-api")
    environment: str = Field(default="production", description="Environment")
    deployment_version: Optional[str] = Field(default=None, description="Deployment version")
    severity: Optional[str] = Field(default=None, description="Severity rating, e.g. SEV-1")
    symptoms: List[str] = Field(default_factory=list, description="Observed symptoms and alerts")
    suspected_cause: Optional[str] = Field(default=None, description="Initial suspected cause")
    confirmed_root_cause: Optional[str] = Field(default=None, description="Diagnosed root cause")
    investigation_steps: List[str] = Field(default_factory=list, description="Investigation steps taken")
    actions_taken: List[str] = Field(default_factory=list, description="Remediation steps executed")
    resolution: str = Field(..., description="How the problem was resolved")
    outcome: str = Field(..., description="Outcome achieved (Successful, Partial, Harmful)")
    impact: Optional[str] = Field(default=None, description="Impact on users or latency")
    duration: Optional[str] = Field(default=None, description="Incident duration")
    failed_approaches: List[str] = Field(default_factory=list, description="Approaches that failed or caused harm")
    successful_approaches: List[str] = Field(default_factory=list, description="Approaches that worked")
    engineering_decisions: List[str] = Field(default_factory=list, description="Engineering policies or decisions")
    warnings: List[str] = Field(default_factory=list, description="Operational warnings and risks")
    lessons_learned: List[str] = Field(default_factory=list, description="Lessons learned for future responders")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")

    def to_experience_document(self) -> str:
        """Convert structured engineering memory into a rich natural language experience document for Hindsight."""
        parts: List[str] = []

        if self.memory_type == "decision":
            header = f"=== ENGINEERING DECISION RECORD: {self.title or self.incident_id} ==="
            parts.append(header)
            parts.append(f"Service: {self.service}")
            parts.append(f"Environment: {self.environment}")
            if self.severity:
                parts.append(f"Severity: {self.severity}")
            if self.engineering_decisions:
                parts.append("Engineering Decisions:")
                for d in self.engineering_decisions:
                    parts.append(f"  * {d}")
            if self.warnings:
                parts.append("Warnings & Operational Risks:")
                for w in self.warnings:
                    parts.append(f"  ! {w}")
            if self.investigation_steps:
                parts.append("Recommended Investigation Approach:")
                for step in self.investigation_steps:
                    parts.append(f"  - {step}")
            if self.resolution:
                parts.append(f"Policy / Resolution: {self.resolution}")
            if self.outcome:
                parts.append(f"Outcome: {self.outcome}")
            if self.lessons_learned:
                parts.append("Key Lessons:")
                for l in self.lessons_learned:
                    parts.append(f"  * {l}")
        else:
            header = f"=== ENGINEERING INCIDENT EXPERIENCE: {self.incident_id or 'INC-RECORD'} ==="
            parts.append(header)
            if self.title:
                parts.append(f"Title: {self.title}")
            parts.append(f"Service: {self.service}")
            parts.append(f"Environment: {self.environment}")
            if self.severity:
                parts.append(f"Severity: {self.severity}")
            if self.deployment_version:
                parts.append(f"Deployment Version: {self.deployment_version}")

            if self.symptoms:
                parts.append("Symptoms:")
                for s in self.symptoms:
                    parts.append(f"  * {s}")

            if self.suspected_cause:
                parts.append(f"Suspected Cause: {self.suspected_cause}")

            if self.confirmed_root_cause:
                parts.append(f"Confirmed Root Cause: {self.confirmed_root_cause}")

            if self.investigation_steps:
                parts.append("Investigation Steps:")
                for step in self.investigation_steps:
                    parts.append(f"  - {step}")

            if self.actions_taken:
                parts.append("Actions Taken:")
                for act in self.actions_taken:
                    parts.append(f"  - {act}")

            parts.append(f"Resolution: {self.resolution}")
            parts.append(f"Outcome: {self.outcome}")

            if self.impact:
                parts.append(f"Impact: {self.impact}")
            if self.duration:
                parts.append(f"Duration: {self.duration}")

            if self.failed_approaches:
                parts.append("Failed or Harmful Approaches:")
                for fa in self.failed_approaches:
                    parts.append(f"  ! {fa}")

            if self.successful_approaches:
                parts.append("Successful Approaches:")
                for sa in self.successful_approaches:
                    parts.append(f"  + {sa}")

            if self.warnings:
                parts.append("Warnings & Pitfalls:")
                for w in self.warnings:
                    parts.append(f"  ! {w}")

            if self.engineering_decisions:
                parts.append("Engineering Decisions:")
                for ed in self.engineering_decisions:
                    parts.append(f"  * {ed}")

            if self.lessons_learned:
                parts.append("Lessons Learned:")
                for ll in self.lessons_learned:
                    parts.append(f"  * {ll}")

        return "\n".join(parts)

    def extract_metadata(self) -> Dict[str, str]:
        """Extract metadata key-value pairs for Hindsight."""
        meta: Dict[str, str] = {
            "service": self.service,
            "environment": self.environment,
            "memory_type": self.memory_type or "incident_postmortem",
        }
        if self.incident_id:
            meta["incident_id"] = self.incident_id
        if self.severity:
            meta["severity"] = self.severity
        if self.deployment_version:
            meta["deployment_version"] = self.deployment_version
        if self.outcome:
            meta["outcome"] = self.outcome
        return meta

    def extract_tags(self) -> List[str]:
        """Generate tags for indexing and retrieval."""
        all_tags = set(self.tags)
        all_tags.add(self.service)
        all_tags.add(self.memory_type)
        if self.incident_id:
            all_tags.add(self.incident_id.lower())
        if self.deployment_version:
            all_tags.add(self.deployment_version.lower())
        return sorted(list(all_tags))
