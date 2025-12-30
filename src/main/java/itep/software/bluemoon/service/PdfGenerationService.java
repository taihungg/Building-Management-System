package itep.software.bluemoon.service;

import java.io.ByteArrayOutputStream;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import itep.software.bluemoon.model.DTO.accounting.invoice.InvoicePdfDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PdfGenerationService {
    private final TemplateEngine templateEngine;

    public byte[] generatePdf(InvoicePdfDTO data) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            Context context = new Context();
            context.setVariable("data", data);
            context.setVariable("counter", new AtomicInteger(1)); // Fix lỗi STT

            String html = templateEngine.process("pdf/invoice_template", context);

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            // --- NẠP FONT CHUẨN ---
            builder.useFont(() -> {
                try {
                    // Dùng getResourceAsStream là cách an toàn nhất cho cả IDE và Docker
                    return getClass().getResourceAsStream("/fonts/TimesNewRoman.ttf");
                } catch (Exception e) {
                    return null;
                }
            }, "Times New Roman"); // Tên này phải khớp với font-family trong CSS

            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();

            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }
}