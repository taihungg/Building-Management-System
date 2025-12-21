package itep.software.bluemoon.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.person.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {
    boolean existsByIdCard(String idCard);

    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
}
