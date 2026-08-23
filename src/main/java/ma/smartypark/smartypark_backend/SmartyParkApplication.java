package ma.smartypark.smartypark_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartyParkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartyParkApplication.class, args);
    }

}
