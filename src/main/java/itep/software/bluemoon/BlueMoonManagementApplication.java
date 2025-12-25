package itep.software.bluemoon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BlueMoonManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlueMoonManagementApplication.class, args);
	}

}
