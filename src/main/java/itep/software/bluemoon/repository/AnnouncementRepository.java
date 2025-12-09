package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
	List<Announcement> findAllByOrderByCreatedAtDesc();
}
