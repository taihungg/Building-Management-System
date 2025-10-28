package itep.software.bluemoon.controller;
import itep.software.bluemoon.entity.Announcement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents") //route cho BQT
public class ResidentController {
    @Autowired
    private ResidentService residentService;


    @GetMapping("/getAllAnnouncement")
    public ResponseEntity<List<Announcement>> getAllAnnouncement(){

        List<Announcement> allAnnouncements = residentService.getAllAnnouncement();

        return ResponseEntity.ok(allAnnouncements);
    }

    



    
    



}
