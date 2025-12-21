package itep.software.bluemoon.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByPersonId(UUID personId);
}
