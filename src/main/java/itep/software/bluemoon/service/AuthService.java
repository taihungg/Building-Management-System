package itep.software.bluemoon.service;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.User;
import itep.software.bluemoon.entity.person.Person;
import itep.software.bluemoon.model.DTO.login.LoginRequest;
import itep.software.bluemoon.model.DTO.login.LoginResponse;
import itep.software.bluemoon.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Wrong password or username not found!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Wrong password or username not found!");
        }

        Person person = user.getPerson();

        return LoginResponse.builder()
                .accountId(user.getId())
                .personId((person != null) ? person.getId() : null)
                .role(user.getRole())
                .build();
    }
}
