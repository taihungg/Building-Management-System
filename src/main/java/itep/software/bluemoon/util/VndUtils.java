package itep.software.bluemoon.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

public class VndUtils {
    private static final Locale VIETNAM_LOCALE = new Locale("vi", "VN");

    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    private static final int SCALE = 0; 

    /**
     * Format số tiền sang chuỗi hiển thị (VD: 50.000 ₫)
     */
    public static String format(BigDecimal amount) {
        if (amount == null) {
            return "0 VNĐ";
        }
        NumberFormat formatter = NumberFormat.getCurrencyInstance(VIETNAM_LOCALE);
        return formatter.format(amount.setScale(SCALE, ROUNDING_MODE));
    }

    /**
     * Cộng tiền an toàn (xử lý null = 0)
     */
    public static BigDecimal add(BigDecimal a, BigDecimal b) {
        return getSafe(a).add(getSafe(b));
    }

    /**
     * Trừ tiền an toàn (a - b)
     */
    public static BigDecimal subtract(BigDecimal a, BigDecimal b) {
        return getSafe(a).subtract(getSafe(b));
    }

    /**
     * Nhân tiền (thường dùng cho số lượng hoặc thuế)
     */
    public static BigDecimal multiply(BigDecimal amount, BigDecimal factor) {
        return getSafe(amount).multiply(getSafe(factor));
    }

    /**
     * Nhân tiền với số lượng (int)
     */
    public static BigDecimal multiply(BigDecimal amount, int quantity) {
        return getSafe(amount).multiply(new BigDecimal(quantity));
    }

    /**
     * Chia tiền (Quan trọng: Luôn làm tròn để tránh lỗi số thập phân vô hạn)
     */
    public static BigDecimal divide(BigDecimal amount, BigDecimal divisor) {
        if (divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new ArithmeticException("Không thể chia cho 0 hoặc null");
        }
        return getSafe(amount).divide(divisor, SCALE, ROUNDING_MODE);
    }
    
    /**
     * Chia tiền cho số nguyên (VD: chia đều hóa đơn)
     */
    public static BigDecimal divide(BigDecimal amount, int divisor) {
        return divide(amount, new BigDecimal(divisor));
    }

    /**
     * Helper: Chuyển null thành 0 để tính toán không lỗi
     */
    private static BigDecimal getSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}