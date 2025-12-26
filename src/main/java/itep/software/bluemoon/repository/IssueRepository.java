package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.enumeration.IssueType;
import itep.software.bluemoon.model.projection.IssueSummary;
@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {
    boolean existsByApartment_Id(UUID apartmentId);
    
    @Query("""
            SELECT i.id as id,
                   a.roomNumber as roomNumber,
                   r.fullName as reporterName,
                   i.title as title,
                   i.description as description,
                   i.status as status,
                   i.type as type
            FROM Issue i
            JOIN i.apartment a
            JOIN i.reporter r
            """)
    List<IssueSummary> findAllIssueSummaries();

    int countByApartment_IdAndStatusIn(UUID apartmentID, List<IssueStatus> statuses);
    
    
    int countByType(IssueType type);
    
    
    @Query("""
            SELECT i.id as id,
                   a.roomNumber as roomNumber,
                   r.fullName as reporterName,
                   i.title as title,
                   i.description as description,
                   i.status as status,
                   i.type as type
            FROM Issue i
            JOIN i.apartment a
            JOIN i.reporter r
            WHERE i.type = :type
            """)
    List<IssueSummary> findIssueSummariesByType(IssueType type);
}
