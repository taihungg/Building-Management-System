package itep.software.bluemoon.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

public class VndUtils {
    private static final Locale VIETNAM_LOCALE = Locale.of("vi", "VN");
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    private static final int SCALE_CURRENCY = 0; 
    private static final int SCALE_RATIO = 4; 

    public static String format(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(VIETNAM_LOCALE);
        symbols.setGroupingSeparator('.'); 
        
        DecimalFormat formatter = new DecimalFormat("###,###", symbols);
        return formatter.format(amount.setScale(SCALE_CURRENCY, ROUNDING_MODE));
    }
    
    public static String formatMoney(BigDecimal amount) {
        return format(amount) + " VNĐ";
    }

    public static BigDecimal add(BigDecimal a, BigDecimal b) {
        return getSafe(a).add(getSafe(b));
    }

    public static BigDecimal subtract(BigDecimal a, BigDecimal b) {
        return getSafe(a).subtract(getSafe(b));
    }

    public static BigDecimal multiply(BigDecimal amount, BigDecimal factor) {
        BigDecimal result = getSafe(amount).multiply(getSafe(factor));
        return result.setScale(SCALE_CURRENCY, ROUNDING_MODE);
    }

    public static BigDecimal multiply(BigDecimal amount, int quantity) {
        return multiply(amount, new BigDecimal(quantity));
    }

    public static BigDecimal divide(BigDecimal amount, BigDecimal divisor) {
        if (divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO; 
        }
        return getSafe(amount).divide(divisor, SCALE_CURRENCY, ROUNDING_MODE);
    }
    
    public static BigDecimal divide(BigDecimal amount, int divisor) {
        return divide(amount, new BigDecimal(divisor));
    }

    public static BigDecimal calculateRatio(BigDecimal dividend, BigDecimal divisor) {
        if (divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getSafe(dividend).divide(divisor, SCALE_RATIO, ROUNDING_MODE);
    }

    private static BigDecimal getSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}