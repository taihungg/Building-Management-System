package itep.software.bluemoon.model.projection;

import java.util.UUID;
import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.enumeration.IssueType;

public interface IssueSummary {
    UUID getId();
    Integer getRoomNumber();      
    String getReporterName();   
    String getTitle();
    String getDescription();
    IssueStatus getStatus();
    IssueType getType();
}