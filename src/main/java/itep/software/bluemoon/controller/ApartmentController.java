package itep.software.bluemoon.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import itep.software.bluemoon.entity.Apartment;
import java.util.List;



@RestController
@RequestMapping("/api/apartment") // Route gốc
public class ApartmentController {

    @Autowired
    private ApartmentService apartmentService;


    @GetMapping("/getAllApartments")
    public ResponseEntity<List<ApartmentDTO>> getAllUnits(){

        List<ApartmentDTO>allApartmentDTOs = apartmentService.getAllUnits();

        return ResponseEntity.ok(allApartmentDTOs);
    }
    
}
