package itep.software.bluemoon.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.model.projection.UsageRecordSummary;
import itep.software.bluemoon.repository.UsageRecordRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UsageRecordService {
    private final UsageRecordRepository usageRecordRepository;
    
    public List<UsageRecordSummary> getUsageRecordsByMonthYear(int month, int year) {
        return usageRecordRepository.findUsageRecordSummariesByMonthYear(month, year);
    }
}