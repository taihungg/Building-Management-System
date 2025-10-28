package itep.software.bluemoon.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import itep.software.bluemoon.entity.Notification;

import java.util.List;

@RestController
@RequestMapping("/api/residents") //route cho BQT
public class ResidentController {
    @Autowired
    private ResidentService residentService;


    @GetMapping("/getAllNontifications")
    public ResponseEntity<List<Notification>> getAllNotifications(){

        List<Notification>allNotifications = residentService.getAllNotifications();

        return ResponseEntity.ok(allNotifications);
    }

    



    
    



}
