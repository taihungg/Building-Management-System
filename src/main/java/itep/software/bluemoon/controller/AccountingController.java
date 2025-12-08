package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.projection.InvoiceSummary;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounting")
@RequiredArgsConstructor
public class AccountingController {
    private final InvoiceService invoiceService;

    // Filter lọc theo trạng thái thanh toán thì front-end tự lọc
    @GetMapping
    public ResponseEntity<Object> getInvoiceSummary(@RequestParam(value = "month", required = false) Integer month, @RequestParam(value = "year", required = false) Integer year){
        List<InvoiceSummary> data = invoiceService.getInvoiceSummary(month, year);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get Invoice summary successfully!",
                data
        );
    }
}
