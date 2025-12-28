package itep.software.bluemoon.model.projection;

public interface RecipientStatusSummary {
    String getResidentName();
    Integer getRoomNumber();
    String getBuildingName();
    Boolean getIsRead();
}