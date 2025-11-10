package itep.software.bluemoon.controller;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ResidentCreationDTO;
import itep.software.bluemoon.model.DTO.ResidentDetailDTO;
import itep.software.bluemoon.model.projection.ResidentSummary;
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
    public List<ResidentSummary> searchByAllInformation(@RequestParam(value = "keyword", required = false) String keyword){
        return residentService.searchByAllInformation(keyword);
    }

    @GetMapping("/{id}")
    public ResidentDetailDTO viewResidentDetail(@PathVariable UUID id){
        return residentService.getResidentDetail(id);
    }

    @PostMapping("/create")
    public Resident createResident(@RequestBody ResidentCreationDTO request){
        return residentService.createResident(request);
    }
}
