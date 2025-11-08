package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.DTO.ResidentSummaryDTO;
import itep.software.bluemoon.service.ResidentService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/residents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ResidentController {
    private final ResidentService residentService;

    @GetMapping
    public List<ResidentSummaryDTO> searchByAllInformation(@RequestParam(value = "keyword", required = false) String phoneNumber){
        return residentService.searchByAllInformation(phoneNumber);
    }
}
