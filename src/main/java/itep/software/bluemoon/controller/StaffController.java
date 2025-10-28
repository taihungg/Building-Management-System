package itep.software.bluemoon.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import itep.software.bluemoon.entity.person.Resident;

import java.util.List;


@RestController
@RequestMapping("/api/staff") //route cho BQT
public class StaffController {
    @Autowired
    private StaffService staffService;
    
    @GetMapping("/getAllResidents")
    public ResponseEntity<List<Resident>> getAllResidents(){

        List<Resident>residents = staffService.getAllResidents();

        return ResponseEntity.ok(residents);
    }

    @GetMapping("/countResidents")
    public ResponseEntity <Integer> countResidents() {

        int number = staffService.countResidents();
        return ResponseEntity.ok(number);
    }
    
    @GetMapping ("/getTotalUnits")
    public ResponseEntity <Integer> getTotalUnits(){
        int number = staffService.getTotalUnits();
        return ResponseEntity.ok(number);
    }



    
    
}
