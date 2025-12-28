package itep.software.bluemoon.enumeration;

public enum CampaignStatus {
	DRAFT,      // cHUẨN BỊ
    ACTIVE,     // Đang mở và đang nhận đóng góp (trước contribution_deadline)
    PENDING,    // Đang mở nhưng không nhận đóng góp nữa (sau contribution_deadline, trước campaign_end_date)
    CLOSED      // Đã kết thúc hoàn toàn
}