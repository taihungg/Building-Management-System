package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.projection.ApartmentDropdown;
import itep.software.bluemoon.service.ApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/apartments")
@RequiredArgsConstructor
public class ApartmentController {
    private final ApartmentService apartmentService;

    //use this api to get basic list apartment to make UUID apartment input
    @GetMapping("/dropdown")
    public List<ApartmentDropdown> searchForDropdown(@RequestParam("keyword") String keyword) {
        return apartmentService.searchApartmentDropdown(keyword);
    }
}
